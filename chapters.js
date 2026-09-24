'use strict';
function chapterSelection(){
 Movement.cancel(actor);clearTimeout(endTimer);
 popup('<div class="eyebrow">THE SECRET OF MY SUCCESS</div><h2>Dein Weg nach oben.</h2><p>Wähle ein Kapitel. Beide sind frei spielbar und speichern ihren Fortschritt getrennt.</p><div class="chapter-cards"><button id="choose-prolog"><strong>Prolog · Raus hier!</strong><span>Vier Schauplätze auf dem Land. Kaffee für Kalle und ein Auto mit Startproblemen.</span></button><a class="chapter-link" id="choose-act1" href="act1.html"><strong>Akt 1 · Herzlich willkommen.</strong><span>Personaleingang hinten. Ein durchgängiges Erdgeschoss, Lieferhof und Technikraum. Dein erster Tag an der Pforte.</span></a></div>','Prolog fortsetzen');
 $('choose-prolog').onclick=()=>{$('modal').close();};
 if(scratch)$('choose-act1').href='act1.html?test=chapters';
}
$('chapters').onclick=chapterSelection;
document.querySelector('.wordmark').onclick=e=>{e.preventDefault();chapterSelection();};
if(new URLSearchParams(location.search).get('chapter')!=='prolog')chapterSelection();
