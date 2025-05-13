const display = document.getElementById('display')

function appendToDisplay(input){
    display.value += input
}

function clearDisplay(){
    display.value = ''
}

function calculate(){
    try{
        display.value = eval(display.value)
    }
    catch(error){
        display.value = 'Error'
    }
}

//додавання івенту для вводу з клавіатури
document.addEventListener('keydown', (e) => { //додає івент, keydown означає, що він спрацьовує при натисанні клавіш; е = event
    const key = e.key; 
    //перевірка умов натискання
    //Додавання символів
    if (!isNaN(key) || key === '.' || ['+', '-', '*', '/'].includes(key)) {
        appendToDisplay(key);
    }
    //Обчислення 
    else if (key === 'Enter' || key === '=') {
        calculate();
    } 
    // Видалення
    else if (key === 'Backspace') {
        display.value = display.value.slice(0, -1);с
    }
});