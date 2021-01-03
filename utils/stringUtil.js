module.exports = {

    /**
     * Check is null or empty
     * @param {*} string 
     */
    isNullOrEmpty(string = '') {
        return string == '' || string == null
    },

    clearTagHTML(string) {
        const regex = /(<([^>]+)>)/ig;
        const result = string.replace(regex, '');
        return result;
    },

    isParseMoney(number) {
        //return number=parseFloat(number.replace(/,/g,''));
        return number = number.replace(/\s?/g, ',').replace(/(\d{3})/g, '$1 ').trim()

    },

    validSpecialCharacter(string) {
        return string.match(/[$&+,:;=?×¶¢@#|<>.\-^*()%!_]+/g);
    },

    containAZ(string) {
        return string.match(/[a-z]|[A-Z]/g);
    },

    containNumber(string) {
        return string.match(/[0-9]/g);
    },

    formatStringCash(cash, formatType = '.') {
        cash = cash.toString();
        let arrCash = cash.split('');
        arrCash = arrCash.reverse();
        var result = [];
        for (let i = 0; i < arrCash.length; i += 3) {
            for (let j = 0; j < 3; j++) {
                result.push(arrCash[i + j])
            }
            result.push(formatType);
        }
        result = result.reverse();
        result.splice(0, 1);
        result = result.join('') + `${formatType == '.' ? ' VND' : ' USD'}`;
        return result;
    },

    formatStringCashNoUnit(cash, formatType = '.', showUnit = true) {
        cash = cash.toString();
        let arrCash = cash.split('');
        arrCash = arrCash.reverse();
        var result = [];
        for (let i = 0; i < arrCash.length; i += 3) {
            for (let j = 0; j < 3; j++) {
                result.push(arrCash[i + j])
            }
            result.push(formatType);
        }
        result = result.reverse();
        result.splice(0, 1);
        if (showUnit) {
            result = result.join('') + '₫';
        }
        return result;
    },

    /**
     * format phone space
     * @param {*} str 
     */
    formatPhoneSpace(str) {
        var one = ""
        var two = ""
        var there = ""
        if (str.length == 10) {
            var one = str.slice(0, 3)
            var two = str.slice(3, 6)
            var there = str.slice(6, 10)
        } else if (str.length == 11) {
            var one = str.slice(0, 4)
            var two = str.slice(4, 7)
            var there = str.slice(7, 11)
        }
        return one + " " + two + " " + there
    },

    validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email)
    }
}