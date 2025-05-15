const display = document.getElementById('display')

// Функція авто-підгонки шрифту
function adjustFontSize() {
    const display = document.getElementById('display');
    const maxWidth = display.clientWidth - 40; // Враховуємо padding
    const baseSize = 5; // Базовий розмір (rem)
    const minSize = 1.5; // Мінімальний розмір (rem)

    // Створюємо прихований елемент для виміру
    const tester = document.createElement('span');
    tester.style.position = 'absolute';
    tester.style.visibility = 'hidden';
    tester.style.whiteSpace = 'nowrap';
    tester.style.font = getComputedStyle(display).font;
    tester.textContent = display.value || '0';
    
    document.body.appendChild(tester);
    const textWidth = tester.offsetWidth;
    document.body.removeChild(tester);

    // Розрахунок нового розміру
    if (textWidth <= maxWidth) {
        display.style.fontSize = `${baseSize}rem`;
    } else {
        const scale = maxWidth / textWidth;
        const newSize = Math.max(minSize, baseSize * scale);
        display.style.fontSize = `${newSize.toFixed(2)}rem`;
    }
}

function appendToDisplay(input){
    display.value += input
    adjustFontSize()
}

function clearDisplay(){
    display.value = ''
    display.placeholder = '0'
    display.style.fontSize = '5rem';
}

function calculate(){
    try{
        let expr = document.getElementById('display').value
            .replace(/\^/g, '**')          // Заміна ^ на **
            .replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)') // √(x) → Math.sqrt(x)
            .replace(/√(\d+)/g, 'Math.sqrt($1)');      // √9 → Math.sqrt(9)
        
        let result = new Function('return ' + expr)();
        
        if (Number.isFinite(result)) {
            result = parseFloat(result.toFixed(7));
        } else if (isNaN(result)) {
            throw new Error('NaN');
        }
        display.value = '';
        display.placeholder = result;
    }
    catch(error){
        display.value = ''
        display.placeholder = 'Error'
    }
    adjustFontSize();
}

function backspace(){
    display.value = display.value.slice(0, -1);
}

//додавання івенту для вводу з клавіатури
document.addEventListener('keydown', (e) => { //додає івент, keydown означає, що він спрацьовує при натисанні клавіш; е = event
    const key = e.key; 
    //перевірка умов натискання
    //Додавання символів
    if (!isNaN(key) || key === '.' || ['+', '-', '*', '/'].includes(key)) {
        appendToDisplay(key);
    }
    else if (key === 's'){
       appendToDisplay('√');
    }
    else if (key === 'q' || key === '^'){
        appendToDisplay('^');
    }
    //Обчислення 
    else if (key === 'Enter' || key === '=') {
        calculate();
    } 
    // Видалення
    else if (key === 'Backspace') {
        backspace()
    }
    else if (key === 'c' || key === 'Escape'){
        clearDisplay()
    }
});

