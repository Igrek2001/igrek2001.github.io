const display = document.getElementById('display')
const mem = document.getElementById('memory-display')
const memDisplay = []

// Автозакриття дужок
function addClosingBracket() {
    if (display.value.includes('(') && !display.value.includes(')')) {
        appendToDisplay(')');
    }
}

// Автоматична підгонка розміру тексту
function fitDisplayText() {
    const content = display.value || display.placeholder;
    const maxWidth = display.clientWidth - 40;

    // Отримуємо початковий розмір шрифту з CSS (або медіазапитів)
    const initialSize = parseFloat(getComputedStyle(display).fontSize);
    const initialSizeRem = initialSize / parseFloat(getComputedStyle(document.documentElement).fontSize);

    // Знаходимо оптимальний розмір шрифту
    let fontSize
    for (fontSize = initialSizeRem; fontSize >= 1; fontSize -= 0.05) {
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

//Функція вводу даних
function appendToDisplay(input) {
    if (input === 'lg' || input === 'ln') display.value += input + '('
    else { display.value += input }
    fitDisplayText()
}

function updateMemory() {
    addClosingBracket()
    const result = calculate()

    if (result !== undefined) {
        const expr = display.value;

        memDisplay.push(`${expr} = ${result}`); // Додаємо вираз і результат в пам'ять

        mem.value = memDisplay.join('\n')

        display.placeholder = result;
        display.value = '';

        scrollTop = scrollHeight;
    }

    fitDisplayText()
}

function calculate() {
    try {
        let expr = document.getElementById('display').value

        expr = processFactorials(expr)

        // Перетворення знаків на математичні вирази
        expr = expr
            .replace(/\^/g, '**') // ^ = **
            .replace(/√(\d+|\([^)]+\))/g, 'Math.sqrt($1)') // sqrt

            .replace(/(\d+)\(/g, '$1*(') // n() = n*()
            .replace(/(\d+)(π|\bpi\b)/g, '$1*$2') // npi = n*pi
            .replace(/(\d+)(e)/g, '$1*$2') // ne = n*e

            .replace(/\)(\d+)/g, ')*$1') // ()n = ()*n
            .replace(/\)\(/g, ')*(') //()() = ()*()

            .replace(/√(\d+)/g, 'Math.sqrt($1)') // √ == sqrt()
            .replace(/π|&pi;|pi/g, 'Math.PI') // Перетворення "pi"
            .replace(/e/g, 'Math.E') // Перетворення "е"

            // Перетворення логарифмів
            .replace(/lg\(([^)]+)\)/g, 'Math.log10($1)') // Десятковий
            .replace(/ln\(([^)]+)\)/g, 'Math.log($1)') // Натуральний

            // Відсотки
            .replace(/([\d.]+)\+([\d.]+)%/g, '($1*(1+$2/100))')  // 100+20% -> 120
            .replace(/([\d.]+)\-([\d.]+)%/g, '($1*(1-$2/100))')  // 100-20% -> 80
            .replace(/(\d+)%/g, '($1/100)')  // 50% -> 0.5

        let result = new Function('function factorial(n) { return n <= 1 ? 1 : n * factorial(n-1); }; return ' + expr)();

        if (isNaN(result)) {
            throw new Error('Неможливо обчислити');
        }
        return result;
    }

    // При помилці:
    catch (error) {
        display.value = '';
        display.placeholder = 'Error';
        return undefined;  // Тут можна додати `display.classList.add('error-shake')`
    }
}

// Нова функція для обробки факторіалів
function processFactorials(expr) {

    if (/![0-9]/.test(expr)) {
        throw new Error('Неправильний формат факторіалу. Використовуйте x!');
    }

    // Регулярний вираз для знаходження факторіалів (числа або дужки)
    const factorialRegex = /(\([^)]+\)|\d+)!/g;

    // Обробляємо всі знайдені факторіали
    return expr.replace(factorialRegex, (match, group) => {
        try {
            // Якщо це дужки, спочатку обчислюємо вміст
            if (group.startsWith('(')) {
                const innerExpr = group.slice(1, -1);
                const value = eval(innerExpr);
                if (value > 170) throw new Error('Число занадто велике для факторіалу');
                return `factorial(${value})`;
            }
            // Якщо це число
            else {
                const num = parseInt(group);
                if (num > 170) throw new Error('Число занадто велике для факторіалу');
                return `factorial(${num})`;
            }
        } catch (e) {
            throw new Error('Неправильний вираз для факторіалу: ' + group);
        }
    });
}

//Очистка дисплею
function clearDisplay() {
    display.value = ''
    display.placeholder = '0'
    display.style.fontSize = '';
    fitDisplayText()
}

// Функція для повного очищення (AC)
function clearAll() {
    memDisplay.length = 0;
    mem.value = '';
    clearDisplay();
}

//функціонал backspace
function backspace() {
    display.value = display.value.slice(0, -1);
    if (display.value === '') display.placeholder = '0';
    fitDisplayText();
}

//додавання івенту для вводу з клавіатури
document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (!isNaN(key) || key === '.' || ['+', '-', '*', '/', ')', '('].includes(key)) {
        appendToDisplay(key);
    }else if (key === 'g') appendToDisplay('lg')
    else if (key === '!') appendToDisplay('!')
    else if (key === 'l') appendToDisplay('ln')
    else if (key === '%') appendToDisplay('%')
    else if (key === '^') appendToDisplay('^');
    else if (key === 's') appendToDisplay('√');
    else if (key === 'r') appendToDisplay('^(-1)')
    else if (key === 'p') appendToDisplay('π')
    else if (key === 'e') appendToDisplay('e')
    else if (key === 'Enter' || key === '=') updateMemory();
    else if (key === 'Backspace') backspace()
    else if (key === 'Escape') clearDisplay()
    else if (e.ctrlKey & key === 'c') clearAll()
    
});

// Фокусуємо інпут при завантаженні
window.addEventListener('DOMContentLoaded', () => display.focus());

// Прибираємо фокус з кнопок після кліку
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => display.focus());
});
