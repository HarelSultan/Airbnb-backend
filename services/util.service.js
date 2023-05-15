function makeId(length = 5) {
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return txt
}

function debounce(func, timeout = 300) {
    let timer
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            func.apply(this, args)
        }, timeout)
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomDates(takenDates) {
    const checkIn = new Date()
    checkIn.setDate(checkIn.getDate() + getRandomInt(0, 120))
    const checkOut = new Date(checkIn)
    const randNumOfNights = getRandomInt(1, 7)
    checkOut.setDate(checkIn.getDate() + randNumOfNights)
    if (isDateRangeTaken(takenDates, { checkIn, checkOut })) {
        console.log('takenDates:', takenDates, 'requestedDates:', { checkIn, checkOut })
        return getRandomDates(takenDates)
    }
    return {
        checkIn,
        checkOut,
    }
}

function isDateRangeTaken(takenDates, requestedDates) {
    if (!takenDates.length) return false
    const requestedCheckIn = requestedDates.checkIn.getTime()
    const requestedCheckOut = requestedDates.checkOut.getTime()
    return takenDates.some(takenDate => {
        const takenCheckIn =
            typeof takenDate.checkIn === 'string' ? new Date(takenDate.checkIn).getTime() : takenDate.checkIn.getTime()
        const takenCheckOut =
            typeof takenDate.checkOut === 'string'
                ? new Date(takenDate.checkOut).getTime()
                : takenDate.checkOut.getTime()
        if (requestedCheckIn < takenCheckOut && requestedCheckOut > takenCheckIn) return true
        return false
    })
}

module.exports = {
    makeId,
    getRandomInt,
    debounce,
    getRandomDates,
}
