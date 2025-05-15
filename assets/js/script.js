const display = document.getElementById('display')

// Автоматична підгонка розміру тексту
function fitDisplayText() {
    const content = display.value || display.placeholder;
    const maxWidth = display.clientWidth - 40;
    
    // Знаходимо оптимальний розмір шрифту
    let fontSize;
    for (fontSize = 4; fontSize >= 1.5; fontSize -= 0.1) {
        const tester = document.createElement('span');
        tester.style.position = 'absolute';
        tester.style.visibility = 'hidden';
        tester.style.whiteSpace = 'nowrap';
        tester.style.fontSize = `${fontSize}rem`;
        tester.style.fontFamily = 'Courier New, monospace';
        tester.textContent = content;
        
        document.body.appendChild(tester);
        const fits = tester.offsetWidth <= maxWidth;
        document.body.removeChild(tester);
        
        if (fits) break;
    }
    
    // Встановлюємо розмір з урахуванням медіа-запитів
    const mediaSize = parseFloat(getComputedStyle(display).fontSize);
    display.style.fontSize = `${Math.min(fontSize, mediaSize)}rem`;
}

function appendToDisplay(input){
    display.value += input
    fitDisplayText()
}

function clearDisplay(){
    display.value = ''
    display.placeholder = '0'
    display.style.fontSize = '';
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
    fitDisplayText();
}

function backspace(){
    display.value = display.value.slice(0, -1);

    if(display.value === '') display.placeholder = '0';

    fitDisplayText();
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

