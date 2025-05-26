// Отримуємо елементи дисплея
const display = document.getElementById('display');
const mem = document.getElementById('memory-display');
const memDisplay = [];
const liveResult = document.getElementById('live-result');

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

    const initialSize = parseFloat(getComputedStyle(display).fontSize);
    const initialSizeRem = initialSize / parseFloat(getComputedStyle(document.documentElement).fontSize);

    let fontSize;
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

        if (fits) {
            break;
        }
    }

    const mediaSize = parseFloat(getComputedStyle(display).fontSize);
    display.style.fontSize = `${Math.min(fontSize, mediaSize)}rem`;
}

function updateLiveResult() {
    try {
        // Якщо поле порожнє або містить лише оператор/функцію без аргументів
        if (!display.value || 
            /[+\-*/^]$/.test(display.value) || 
            /(sin|cos|tg|ctg|ln|lg|sqrt|fact)\($/.test(display.value)) {
            liveResult.value = '';
            return;
        }
        
        const result = calculate();
        liveResult.value = result !== undefined ? formatResult(result) : '';
    } catch {
        liveResult.value = 'Error';
    }
}

// Додаємо обробник тільки для цифр і крапки
document.querySelectorAll('#keys button, #simplified button').forEach(btn => {
    if (btn.id && ['zero','one','two','three','four','five','six','seven','eight','nine','dot'].includes(btn.id)) {
        btn.addEventListener('click', updateLiveResult);
    }
});

// Спеціальна обробка для кнопки "="
document.getElementById('equals')?.addEventListener('click', function() {
    setTimeout(updateLiveResult, 10);  // Невелика затримка для оновлення
});

display.addEventListener('input', updateLiveResult);

//Функція вводу даних
function appendToDisplay(input) {
    const directTrigFuncs = ['sin', 'cos', 'tg', 'ctg'];
    const inverseTrigFuncs = ['asin', 'acos', 'atg', 'actg'];
    const otherFuncs = ['lg', 'ln'];
    const allFuncs = [...directTrigFuncs, ...inverseTrigFuncs, ...otherFuncs];

    if (allFuncs.includes(input)) {
        display.value += input + '(';
        fitDisplayText();
        return;
    }

    if (input === ')') {
        handleClosingBracket(directTrigFuncs, inverseTrigFuncs);
        fitDisplayText();
        return;
    }

    display.value += input;
    fitDisplayText();
    updateClearButton();
}

function isInsideFunction() {
    if (display.value.match(/(sin|cos|tg|ctg)\([^\u00B0)]*$/)) {
        return true;
    }
    if (display.value.match(/(asin|acos|atg|actg)\([^)]*$/)) {
        return true;
    }
    if (display.value.match(/(lg|ln|sqrt|fact)\([^)]*$/)) {
        return true;
    }
    return false;
}

function handleClosingBracket(directFuncs, inverseFuncs) {
    const isDirectTrig = directFuncs.some(function (func) {
        const pattern = new RegExp(`${func}\\([^\\u00B0)]+$`);
        return pattern.test(display.value);
    });

    const isInverseTrig = inverseFuncs.some(function (func) {
        const pattern = new RegExp(`${func}\\([^)]+$`);
        return pattern.test(display.value);
    });

    if (isDirectTrig) {
        const inside = display.value.match(/(?:^|[^a-zA-Z])(sin|cos|tg|ctg)\(([^)]*)$/);
        if (inside && !inside[2].includes('°')) {
            display.value += '°';
        }
        display.value += ')';
    } else {
        display.value += ')';
    }
}

// Заміна кнопок тригонометричних функцій
let isReverseMode = false; //Режим реверсивних функцій

function replaceTrig() {
    const trigButtons = [
        { id: 'sin', reverseId: 'revSin', text: 'sin', tooltip: 's', reverseText: 'sin⁻¹', action: 'sin', reverseAction: 'asin' },
        { id: 'cos', reverseId: 'revCos', text: 'cos', tooltip: 'o', reverseText: 'cos⁻¹', action: 'cos', reverseAction: 'acos' },
        { id: 'tg', reverseId: 'revTg', text: 'tg', tooltip: 't', reverseText: 'tg⁻¹', action: 'tg', reverseAction: 'atg' },
        { id: 'ctg', reverseId: 'revCtg', text: 'ctg', tooltip: 'g', reverseText: 'ctg⁻¹', action: 'ctg', reverseAction: 'actg' }
    ];

    // Видаляємо поточні кнопки
    trigButtons.forEach(btn => {
        let element;
        if (isReverseMode) {
            element = document.getElementById(btn.reverseId);
        } else {
            element = document.getElementById(btn.id);
        }
        if (element) element.remove();
    });

    // Створюємо нові кнопки
    trigButtons.forEach(btn => {
        const button = document.createElement('button');

        if (isReverseMode) {
            button.id = btn.id;
            button.textContent = btn.text;
        } else {
            button.id = btn.reverseId;
            button.textContent = btn.reverseText;
        }

        button.classList.add('data')
        button.style = `grid-area: ${btn.id}`;
        button.setAttribute('data-tooltip', btn.tooltip);

        if (isReverseMode) {
            button.addEventListener('click', function () {
                appendToDisplay(btn.action);
            });
        } else {
            button.addEventListener('click', function () {
                appendToDisplay(btn.reverseAction);
            });
        }

        keys.appendChild(button);
    });

    isReverseMode = !isReverseMode; // Змінюємо режим
}

function updateMemory() {
    addClosingBracket();
    const result = calculate();

    if (result !== undefined) {
        const expr = display.value;
        memDisplay.push(`${expr} = ${result}`);
        mem.value = memDisplay.join('\n');
        display.placeholder = result;
        display.value = '';
    }

    fitDisplayText();
    updateClearButton();
}

function calculate() {
    try {
        let expr = display.value;
        expr = processInverseTrig(expr);
        expr = processFactorials(expr);
        expr = processDirectTrig(expr);

        // Перетворення знаків на математичні вирази
        expr = expr
            .replace(/\^/g, '**') // ^ = **
            .replace(/√(\d+|\([^)]+\))/g, 'Math.sqrt($1)') // √ == sqrt()

            // Автододавання множення: n(...)
            .replace(/(\d+)\(/g, '$1*(') // n() = n*()
            .replace(/(\d+)(π|pi|e|lg|ln)/g, '$1*$2') // nπ/ne/nlg/nln = n*π...

            // Зв'язок між виразами без оператора
            .replace(/\)(\d+)/g, ')*$1') // ()n = ()*n
            .replace(/\)\(/g, ')*(')     // ()() = ()*()

            // Перетворення математичних функцій
            .replace(/√(\d+)/g, 'Math.sqrt($1)') // √
            .replace(/π|&pi;|pi/g, 'Math.PI')    // pi
            .replace(/e/g, 'Math.E')            // e

            // Логарифми
            .replace(/lg\(([^)]+)\)/g, 'Math.log10($1)') // Десятковий
            .replace(/ln\(([^)]+)\)/g, 'Math.log($1)')   // Натуральний

            // Відсотки
            .replace(/([\d.]+)\+([\d.]+)%/g, '($1*(1+$2/100))')  // 100+20% -> 120
            .replace(/([\d.]+)\-([\d.]+)%/g, '($1*(1-$2/100))')  // 100-20% -> 80
            .replace(/(\d+)%/g, '($1/100)');                     // 50% -> 0.5


        let result = new Function(
            'function factorial(n) { if (n <= 1) return 1; else return n * factorial(n-1); }; return ' + expr
        )();

        return formatResult(result);
    } catch (error) {
        display.value = '';
        display.placeholder = 'Error';
        return undefined;
    }
}

// Форматування результату
function formatResult(value) {
    if (typeof value !== 'number') {
        return value;
    }

    const rounded = parseFloat(value.toFixed(6));
    const formatted = rounded % 1 === 0 ? Math.round(rounded) : rounded;

    return formatted;
}


// Обробка прямих тригонометричних функцій (градуси → радіани)
function processDirectTrig(expr) {
    expr = expr.replace(/ctg\(([^)]+)°\)/g, '(1/Math.tan($1*Math.PI/180))')
        // Автододавання множення перед функціями
        .replace(/(\d)(sin|cos|tg|ctg)/g, '$1*$2')
        .replace(/\)(sin|cos|tg|ctg)/g, ')*$1')

    const funcMap = {
        'sin': 'sin',
        'cos': 'cos',
        'tg': 'tan'
    };

    for (const func in funcMap) {
        const jsFunc = funcMap[func];
        const regex = new RegExp(`${func}\\(([^)]+)°\\)`, 'g');
        expr = expr.replace(regex, `Math.${jsFunc}($1*Math.PI/180)`);
    }

    return expr;
}

// Обробка зворотних тригонометричних функцій (радіани → градуси)
function processInverseTrig(expr) {
    expr = expr
        .replace(/asin\(([^)]+)\)/g, '(Math.asin($1) * 180 / Math.PI)')
        .replace(/acos\(([^)]+)\)/g, '(Math.acos($1) * 180 / Math.PI)')
        .replace(/atg\(([^)]+)\)/g, '(Math.atan($1) * 180 / Math.PI)')
        // Автододавання множення перед функціями
        .replace(/(\d)(asin|acos|atg|actg)/g, '$1*$2')
        .replace(/\)(asin|acos|atg|actg)/g, ')*$1')

    // Обробка actg як оберненого котангенса: arccot(x) = arctan(1/x)
    expr = expr.replace(/actg\(([^)]+)\)/g, '((Math.atan(1/($1))) * 180 / Math.PI)');

    return expr;
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

//Перемикання між калькуляторами
let invert = false;
const simpl = document.getElementById('simplified')
const expanded = document.getElementById('keys')
function invertCalc() {
    if (invert) {
        simpl.style.display = 'grid'
        expanded.style.display = 'none'
    } else {
        simpl.style.display = 'none'
        expanded.style.display = 'grid'
    }
    updateClearButton();
    invert = !invert
}

//Зміна кнопки очищення
function updateClearButton() {
    const allClearButtons = document.querySelectorAll('.allClear');
    const displayValue = display.value;

    allClearButtons.forEach(button => {
        if (displayValue !== '') {
            button.textContent = 'C';
        } else {
            button.textContent = 'AC';
        }
    });
}

function clearing() {
    const displayValue = display.value;
    if (displayValue !== '') clearDisplay()
    else clearAll()
}

function clearDisplay() {
    display.value = ''
    display.placeholder = '0'
    display.style.fontSize = '';
    updateClearButton();
    liveResult.value = '';
}
// Функція для повного очищення (AC)
function clearAll() {
    memDisplay.length = 0;
    mem.value = '';
    liveResult.value = '';
}

//функціонал backspace
function backspace() {
    display.value = display.value.slice(0, -1);
    if (display.value === '') display.placeholder = '0';
    fitDisplayText();
    updateClearButton();
}

//додавання івенту для вводу з клавіатури
document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (!isNaN(key) || key === '.' || ['+', '-', '*', '/', ')', '('].includes(key)) {
        appendToDisplay(key);
    } else if (key === 'd') appendToDisplay('lg');
    else if (key === '!') appendToDisplay('!');
    else if (key === 'l') appendToDisplay('ln');
    else if (key === '%') appendToDisplay('%');
    else if (key === '^') appendToDisplay('^');
    else if (key === 'q') appendToDisplay('√');
    else if (key === 'r') appendToDisplay('^(-1)');
    else if (key === 'p') appendToDisplay('π');
    else if (key === 'e') appendToDisplay('e');
    else if (key === 's') {
        if (!isReverseMode) appendToDisplay('sin');
        else appendToDisplay('asin');
    } else if (key === 'o') {
        if (!isReverseMode) appendToDisplay('cos');
        else appendToDisplay('acos');
    } else if (key === 't') {
        if (!isReverseMode) appendToDisplay('tg');
        else appendToDisplay('atg');
    } else if (key === 'g') {
        if (!isReverseMode) appendToDisplay('ctg');
        else appendToDisplay('actg');
    } else if (key === 'n') replaceTrig();
    else if (key === 'Enter' || key === '=') updateMemory();
    else if (key === 'Backspace') backspace();
    else if (key === 'Escape' || e.ctrlKey & key === 'c') {
        const displayValue = display.value;
        if (displayValue !== '') clearDisplay();
        else clearAll();
    }
});

document.addEventListener('keydown', (e) => {
    const key = e.key;
    if(!isNaN(key)) updateLiveResult();
})

// Фокусуємо інпут при завантаженні
window.addEventListener('DOMContentLoaded', () => display.focus());

// Прибираємо фокус з кнопок після кліку
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => display.focus());
});
