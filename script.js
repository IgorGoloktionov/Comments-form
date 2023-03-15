"use strict";

const fields = {
    inputName: document.getElementById('input-name'),
    nameNotification: document.getElementById('name-notification'),
    textNotification: document.getElementById('text-notification'),
    inputText: document.getElementById('input-text'),
    inputDate: document.getElementById('input-date'),
    buttonSend: document.getElementById('button-send'),

    commentField: document.getElementById('comment-field'),
    insteaded: document.getElementById('insteaded'),
    nameField: document.getElementById('name-field'),
    textField: document.getElementById('text-filed'),
}

showContent();
//Слушатели событий для валидации
let validation = validationWrapper()
fields.inputName.addEventListener('keyup', validation)
fields.inputText.addEventListener('keyup', validation)
//Слушатели событий для кнопки отправить комментарий
fields.buttonSend.addEventListener('click', buttonPressed)
document.addEventListener('keyup', buttonPressed)

//Функции валидации
function validationWrapper() {
    let flagName = true;
    let flagText = true;
    
    function validation(e) {
        if (e.key === 'Enter') {
            flagName = nameValidation(fields.inputName.value);
            flagText = textValidation(fields.inputText.value);
        } else {
            let field = e.target;
            let input = e.target.value;
            if (field === fields.inputName) {
                let resultName = nameValidation(input);
                showNotification(resultName, fields.nameNotification, fields.inputName);
                flagName = resultName;
            }
            if (field === fields.inputText) {
                let resultText = textValidation(input);
                showNotification(resultText, fields.textNotification, fields.inputText); 
                flagText = resultText;
            }    
        }
        if (!flagName && !flagText) fields.buttonSend.setAttribute('data-visible', 'true');
            else fields.buttonSend.setAttribute('data-visible', 'false');
    }
    
    return validation;
}


/* Функция валидации имени:
    * На вход: строка;
    * Возращает: true или строку с предупреждением */
function nameValidation(text) {
    text = text.trim();
    let flagCountWords, flagNumber, flagCountLetters;
    flagNumber = flagCountLetters = flagCountWords = true;

    if (text.split(' ').length > 3) flagCountWords = false;
    
    for (let i = 0; i < 10; i++) {
        if (text.includes(i)) flagNumber = false;
    }

    for (let words of text.split(' ')) {
        if (words.length > 20 || words.length < 2) flagCountLetters = false;
    }

    if (!flagNumber || !flagCountWords || !flagCountLetters) {
        let message = ['Имя не может'];

        if (!flagNumber) message.push(' содержать в себе цифры');

        if (!flagCountWords) {

            switch (message.length) {
                case 2: 
                    message.push(' и быть длинее 3 слов');
                    break;
                case 1:
                    message.push(' быть длинее 3 слов');
                    break;    
            }   
        }

        if (!flagCountLetters) {

            switch (message.length) {
                case 3: 
                    message.push(', а также оно должно быть длиной минимум 2 буквы и максимум - 20.');
                    break;
                case 2: 
                    message.push(' и быть короче 2 букв или длинее - 20.');
                    break;
                case 1:
                    message.push(' быть короче 2 букв или длинее - 20.');
                    break;    
            }   
        }
        message = message.join('');
        return message;
        
    } else {
       return false;
    }
} 

/* Функция валидации текста комментария:
    * На вход: строка;
    * Возращает: true или строку с предупреждением */
function textValidation(text) {
    if (text.length < 1) return 'Комментарий не может быть пустым'
    return false;
}

    
// Функция вывода уведомления о валидации
function showNotification(result, fieldNotification, fieldInput) {
    if (result) {
        fieldNotification.innerHTML = result;
        fieldNotification.setAttribute('data-validation', 'false')
        fieldInput.setAttribute('data-validation', 'false')
    } else {
        fieldNotification.innerHTML = 'все в порядке';
        fieldNotification.setAttribute('data-validation', 'true');
        fieldInput.setAttribute('data-validation', 'true') 
    }

}

// Функция срабатывания кнопки
function buttonPressed (e) {
    if (e.type === 'click' || (e.type === 'keyup' && e.key === 'Enter')) {
        if (fields.buttonSend.getAttribute('data-visible') === 'true') {
            saveComment();
            clearFields();
            validation(e);
            showContent();
        }
    }
}

//Фнукция сохранения комментария в локальном хранилище
function saveComment() {
    if (!loadFromLocal()) {
        let content = {
            commentsId: [],
            comments: {},
        }

        content.commentsId[0] = 1;
        content.comments[1] = {}
        let comment = content.comments[1];

        comment.name = nameDecorator(fields.inputName.value);
        comment.text = fields.inputText.value.trim();
        comment.liked = false;
        if (fields.inputDate.value) {
            let date = new Date(fields.inputDate.value);
            let time = new Date();
            date.setHours(time.getHours());
            date.setMinutes(time.getMinutes());
            comment.date = date.getTime();
        } else comment.date = (new Date()).getTime();

        saveToLocal(content);

    } else {
        let content = loadFromLocal();
        content.commentsId.push(content.commentsId[content.commentsId.length - 1] + 1);
        let commentId = content.commentsId[content.commentsId.length - 1];
        content.comments[commentId] = {};
        let comment = content.comments[commentId];
        comment.name = nameDecorator(fields.inputName.value);
        comment.text = fields.inputText.value.trim();
        comment.liked = false;
        if (fields.inputDate.value) {
            let date = new Date(fields.inputDate.value);
            let time = new Date();
            date.setHours(time.getHours());
            date.setMinutes(time.getMinutes());
            comment.date = date.getTime();
        } else comment.date = (new Date()).getTime();

        saveToLocal(content);
    }   
}

function saveToLocal(content) {
    localStorage.setItem('content', JSON.stringify(content));
}

//Загрузка данных из локального хранилища
function loadFromLocal() {
    if (localStorage.length < 1) return false;
    return JSON.parse(localStorage.getItem('content'))
}

//Очистка формы после добавления комментария 
function clearFields() {
    fields.inputName.value = '';
    fields.inputText.value = '';
    fields.inputDate.value = '';
}
//Показ контента
function showContent() {
    if (!loadFromLocal()) {
        showInsteaded('true');
        let elements = document.querySelectorAll('.content');
        elements.forEach((elem) => elem.remove());
    }
    else {
        showInsteaded('false');
        showComments();
    }   
}

//Показ сообщения о том, что комментариев нет
function showInsteaded(a) {
    fields.insteaded.setAttribute('data-visibility', a)
}

//Показ комментариев
function showComments() {
    let content = loadFromLocal();
    let arrId = content.commentsId;
    let comments = content.comments;
    let elements = document.querySelectorAll('.content');
    elements.forEach((elem) => elem.remove())

    for (let i = 0; i < arrId.length; i++) {
        let id = arrId[i];
        let currentComment = comments[id];
        let name = currentComment.name;
        let text = currentComment.text;
        let date = dateDecorator(currentComment.date);
        let like = currentComment.liked ? `<i id="button-like-${id}" class="fa fa-heart" aria-hidden="true"></i>` : `<i id="button-like-${id}" class="fa fa-heart-o" aria-hidden="true"></i>`;
        let html = `<div class="out__content content"><div class="content__name-date"><p class="content__name">${name}</p><p class="content__date">${date}</p></div><p class="content__text">${text}</p><div class="content__buttons buttons"><p  class="buttons__basket"><i id="button-basket-${id}" class="fa fa-trash" aria-hidden="true"></i></p><p class="buttons__like">${like}</p></div></div>`
        fields.commentField.insertAdjacentHTML("afterbegin", html);
        document.getElementById(`button-basket-${id}`).addEventListener('click', removeComment, {once: true});
        document.getElementById(`button-like-${id}`).addEventListener('click', setLikeComment);
    }

}

//Функция удаления комментария
function removeComment(e) {
    let commentId = (e.target.id).slice(14);
    let content = loadFromLocal();
    let arrId = content.commentsId;
    let comments = content.comments;
    arrId.splice(arrId.indexOf(+commentId), 1);
    delete comments[commentId];
    document.getElementById(`button-basket-${commentId}`).removeEventListener('click', setLikeComment);
    localStorage.clear();
    if (arrId.length > 0) saveToLocal(content);
    showContent();
}

//Функция установки/снятия лайка
function setLikeComment(e) {
    let commentId = (e.target.id).slice(12);
    let content = loadFromLocal();
    let comments = content.comments;
    let liked = comments[commentId].liked;
    comments[commentId].liked = !liked;
    saveToLocal(content);
    showContent();
}

//Функция, которая улучшает внешний вид введенного имени
function nameDecorator(str) {
    str = str.trim()
    let arrWords = str.split(' ');
    for (let i = 0; i < arrWords.length; i++) {
        arrWords[i] = arrWords[i][0].toUpperCase() + arrWords[i].slice(1);
    }

    return arrWords.join(' ');
}

//Функция, которая форматирует отображение текущей даты
function dateDecorator(date) {
    let now = new Date();
    let moth = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    let diff = now.getDate() - (new Date(date)).getDate();
    switch (diff) {
        case 0:
            return `Сегодня ${(new Date(date)).getHours()}:${(new Date(date)).getMinutes()}`;
        case 1:
            return `Вчера ${(new Date(date)).getHours()}:${(new Date(date)).getMinutes()}`;
    }
    return `${(new Date(date)).getDate()} ${moth[(new Date(date)).getMonth()]} ${(new Date(date)).getFullYear()} г. ${(new Date(date)).getHours()}:${(new Date(date)).getMinutes()}` 
}
