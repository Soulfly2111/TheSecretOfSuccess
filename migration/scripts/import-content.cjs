// One-time importer of our trusted, checked-in reference version. Runtime never evaluates source.
const fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm'),
  ts = require('typescript');
const root = path.resolve(__dirname, '../..'),
  out = path.resolve(__dirname, '../src/content');
fs.mkdirSync(out, { recursive: true });
const source = (n) => fs.readFileSync(path.join(root, n), 'utf8');
const write = (n, v) =>
  fs.writeFileSync(path.join(out, n + '.json'), JSON.stringify(v, null, 2) + '\n');
const walk = (node, fn) => {
  fn(node);
  ts.forEachChild(node, (n) => walk(n, fn));
};
const lit = (value) => ({ literal: value });
const op = (name, ...args) => ({ op: name, args });
function expr(n, prefix = '') {
  if (ts.isParenthesizedExpression(n)) return expr(n.expression, prefix);
  if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return lit(n.text);
  if (ts.isNumericLiteral(n)) return lit(Number(n.text));
  if (n.kind === ts.SyntaxKind.TrueKeyword) return lit(true);
  if (n.kind === ts.SyntaxKind.FalseKeyword) return lit(false);
  if (n.kind === ts.SyntaxKind.NullKeyword) return lit(null);
  if (ts.isIdentifier(n)) return n.text === 'undefined' ? lit(null) : { ref: [n.text] };
  if (ts.isPropertyAccessExpression(n))
    return op('get', expr(n.expression, prefix), lit(n.name.text));
  if (ts.isElementAccessExpression(n))
    return op('get', expr(n.expression, prefix), expr(n.argumentExpression, prefix));
  if (ts.isArrayLiteralExpression(n)) return { list: n.elements.map((x) => expr(x, prefix)) };
  if (ts.isObjectLiteralExpression(n))
    return {
      record: Object.fromEntries(
        n.properties.map((x) => [x.name.text, expr(x.initializer, prefix)]),
      ),
    };
  if (ts.isPrefixUnaryExpression(n) && n.operator === ts.SyntaxKind.ExclamationToken)
    return op('not', expr(n.operand, prefix));
  if (ts.isConditionalExpression(n))
    return op(
      'choose',
      expr(n.condition, prefix),
      expr(n.whenTrue, prefix),
      expr(n.whenFalse, prefix),
    );
  if (ts.isTemplateExpression(n))
    return op(
      'concat',
      lit(n.head.text),
      ...n.templateSpans.flatMap((x) => [expr(x.expression, prefix), lit(x.literal.text)]),
    );
  if (ts.isBinaryExpression(n)) {
    const names = {
      '===': 'eq',
      '!==': 'ne',
      '&&': 'and',
      '||': 'or',
      '??': 'coalesce',
      '+': 'concat',
    };
    const name = names[n.operatorToken.getText()];
    if (name) return op(name, expr(n.left, prefix), expr(n.right, prefix));
  }
  if (ts.isCallExpression(n)) {
    const callee = n.expression,
      args = n.arguments.filter((x) => !ts.isArrowFunction(x)).map((x) => expr(x, prefix));
    if (ts.isPropertyAccessExpression(callee)) {
      if (callee.name.text === 'includes')
        return op('includes', expr(callee.expression, prefix), ...args);
      if (callee.name.text === 'push') return op('push', expr(callee.expression, prefix), ...args);
      if (callee.name.text === 'filter') {
        const lambda = n.arguments[0];
        if (
          !ts.isArrowFunction(lambda) ||
          !ts.isBinaryExpression(lambda.body) ||
          lambda.body.operatorToken.getText() !== '!=='
        )
          throw Error('Only removal filters allowed');
        return op('filterOut', expr(callee.expression, prefix), expr(lambda.body.right, prefix));
      }
      if (
        callee.name.text === 'join' &&
        ts.isCallExpression(callee.expression) &&
        callee.expression.expression.name?.text === 'map'
      )
        return op(
          'joinLines',
          expr(
            callee.expression.arguments[0] ? callee.expression.expression.expression : null,
            prefix,
          ),
        );
      if (callee.expression.getText() === 'Photo')
        return op('call:photo.' + callee.name.text, ...args);
    }
    const name = callee.getText();
    if (['has', 'add', 'remove', 'note'].includes(name)) return op(name, ...args);
    if (name === 'line') return { record: { speaker: args[0], text: args[1] } };
    if (
      [
        'act',
        'hint',
        'manualText',
        'dialogue',
        'visible',
        'options',
        'status',
        'ready',
        'journal',
      ].includes(name)
    )
      return op('call:' + prefix + name, ...args);
  }
  throw Error('Unmapped expression: ' + n.getText());
}
function keys(n) {
  if (ts.isIdentifier(n)) return [lit(n.text)];
  if (ts.isPropertyAccessExpression(n)) return [...keys(n.expression), lit(n.name.text)];
  if (ts.isElementAccessExpression(n)) return [...keys(n.expression), expr(n.argumentExpression)];
  throw Error('Unmapped assignment ' + n.getText());
}
function commands(node, prefix = '') {
  if (ts.isBlock(node)) return node.statements.flatMap((n) => commands(n, prefix));
  if (ts.isIfStatement(node))
    return [
      {
        kind: 'branch',
        condition: expr(node.expression, prefix),
        yes: commands(node.thenStatement, prefix),
        no: node.elseStatement ? commands(node.elseStatement, prefix) : [],
      },
    ];
  if (ts.isReturnStatement(node))
    return [{ kind: 'return', value: node.expression ? expr(node.expression, prefix) : lit(null) }];
  if (ts.isVariableStatement(node))
    return node.declarationList.declarations
      .filter((d) => !ts.isArrowFunction(d.initializer))
      .map((d) => ({ kind: 'let', name: d.name.text, value: expr(d.initializer, prefix) }));
  if (ts.isExpressionStatement(node)) {
    const n = node.expression;
    if (ts.isBinaryExpression(n) && ['=', '||='].includes(n.operatorToken.getText()))
      return [
        {
          kind: 'set',
          path: keys(n.left),
          value: expr(n.right, prefix),
          operator: n.operatorToken.getText(),
        },
      ];
    return [{ kind: 'effect', value: expr(n, prefix) }];
  }
  throw Error('Unmapped command ' + node.getText());
}
function logic(file, names, prefix = '') {
  const parsed = ts.createSourceFile(file, source(file), ts.ScriptTarget.Latest, true),
    programs = {};
  walk(parsed, (n) => {
    if (ts.isFunctionDeclaration(n) && names.includes(n.name?.text))
      programs[prefix + n.name.text] = {
        parameters: n.parameters.map((p) => p.name.text),
        commands: commands(n.body, prefix),
      };
  });
  const constants = {};
  walk(parsed, (n) => {
    if (
      ts.isVariableDeclaration(n) &&
      ['descriptions', 'conversations', 'doorFlags', 'items'].includes(n.name.getText()) &&
      n.initializer
    ) {
      try {
        constants[n.name.text] = vm.runInNewContext('(' + n.initializer.getText() + ')');
      } catch {}
    }
  });
  return { programs, constants };
}
const prolog = logic('engine.js', ['act', 'hint', 'manualText']);
write('prolog-logic', prolog);
const act1 = logic('act1-engine.js', ['act', 'hint', 'visible', 'dialogue', 'options']),
  photo = logic(
    'act1-photo.js',
    ['act', 'ready', 'status', 'reception', 'issue', 'hint', 'journal'],
    'photo.',
  );
act1.programs = { ...act1.programs, ...photo.programs };
write('act1-logic', act1);
const movement = require(path.join(root, 'movement.js')),
  world = require(path.join(root, 'act1-world.js'));
const prologMaps = structuredClone(movement.maps);
world.install(movement);
const prefix = source('game.js').split('let state=')[0] + '\nresult=rooms;';
const sandbox = { result: null };
vm.runInNewContext(
  prefix
    .replace('const $=id=>document.getElementById(id),A=Adventure;', '')
    .replace(/const scratch=.*?;/, ''),
  sandbox,
);
const rooms = sandbox.result;
for (const [id, room] of Object.entries(rooms)) {
  room.geometry = prologMaps[id];
  room.camera = [0, 0];
}
const prologConnections = {
  yard: ['house', 'barn', 'garage'].map((to) => ({ target: to, to, entry: 'yard' })),
  house: [{ target: 'yard', to: 'yard', entry: 'house' }],
  barn: [{ target: 'yard', to: 'yard', entry: 'barn' }],
  garage: [{ target: 'yard', to: 'yard', entry: 'garage' }],
};
write('prolog-world', {
  rooms,
  npcs: { mechanic: [0, 703, 451] },
  connections: prologConnections,
  entries: {
    yard: prologMaps.yard.entries,
    house: { yard: prologMaps.house.spawn },
    barn: { yard: prologMaps.barn.spawn },
    garage: { yard: prologMaps.garage.spawn },
  },
});
write('act1-world', {
  rooms: world.rooms,
  npcs: world.npcs,
  connections: world.connections,
  entries: world.entries,
});
write('items', {
  prolog: require(path.join(root, 'engine.js')).items,
  act1: require(path.join(root, 'act1-engine.js')).items,
});
console.log('Imported two chapters, bounded action programs and 14 rooms from reference.');
