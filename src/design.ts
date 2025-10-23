// design.ts
import './card.css'
import './style.css'
import './design.css'

/*
const startBtn = document.getElementById('startBtn')! as HTMLInputElement
startBtn!.addEventListener('click', async () => {
    document.querySelector('.trick-0')!
        .setAttribute('style', 'animation: move-to-location 500ms ease-in-out forwards;');

});
*/

const elements = document.querySelectorAll('.card');

var totalTrick=0

elements.forEach(element => {
  element.addEventListener('click', () => {
    const parentId=element.parentElement?.id
    const playerId=parentId?.split('-')[1]
    const trickId="trick-"+playerId
    const trickElement=document.getElementById(trickId)
    if (trickElement) {
        trickElement.appendChild(element);
        totalTrick++
    }

    if (totalTrick===4){
        
    }

  });
});

