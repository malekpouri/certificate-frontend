import moment from 'moment-jalaali';

// تابع محاسبه سن بر اساس تاریخ تولد شمسی
export const calculateAgeInShamsi = (birthDateGregorian) => {
    if (!birthDateGregorian) {
        return null;
    }

    try {
        // تبدیل تاریخ تولد میلادی به moment
        const birthMoment = moment(birthDateGregorian, 'YYYY-MM-DD');
        if (!birthMoment.isValid()) {
            console.error('Invalid birth date:', birthDateGregorian);
            return null;
        }

        // تاریخ امروز
        const today = moment();

        // محاسبه سن بر اساس تقویم شمسی
        const birthJYear = birthMoment.jYear();
        const birthJMonth = birthMoment.jMonth();
        const birthJDate = birthMoment.jDate();

        const todayJYear = today.jYear();
        const todayJMonth = today.jMonth();
        const todayJDate = today.jDate();

        // محاسبه سن اولیه
        let age = todayJYear - birthJYear;

        // بررسی اینکه آیا تولد امسال گذشته یا نه
        if (todayJMonth < birthJMonth ||
            (todayJMonth === birthJMonth && todayJDate < birthJDate)) {
            age--;
        }

        console.log(`Birth: ${birthJYear}/${birthJMonth + 1}/${birthJDate}`);
        console.log(`Today: ${todayJYear}/${todayJMonth + 1}/${todayJDate}`);
        console.log(`Calculated age: ${age}`);

        return age;
    } catch (error) {
        console.error('Error calculating age:', error);
        return null;
    }
};

// تابع محاسبه سن بر اساس تاریخ تولد میلادی (برای مقایسه)
export const calculateAgeInGregorian = (birthDateGregorian) => {
    if (!birthDateGregorian) {
        return null;
    }

    try {
        const birthMoment = moment(birthDateGregorian, 'YYYY-MM-DD');
        if (!birthMoment.isValid()) {
            return null;
        }

        const today = moment();
        const age = today.diff(birthMoment, 'years');

        console.log(`Gregorian age calculation: ${age}`);
        return age;
    } catch (error) {
        console.error('Error calculating gregorian age:', error);
        return null;
    }
};

// تابع اعتبارسنجی سن
export const validateAge = (birthDateGregorian, minAge = 10, maxAge = 100, useShamsiCalendar = true) => {
    const age = useShamsiCalendar ?
        calculateAgeInShamsi(birthDateGregorian) :
        calculateAgeInGregorian(birthDateGregorian);

    if (age === null) {
        return {
            isValid: false,
            message: 'تاریخ تولد نامعتبر است',
            age: null
        };
    }

    if (age < minAge || age > maxAge) {
        return {
            isValid: false,
            message: `سن نامعتبر است: ${age} سال. باید بین ${minAge} تا ${maxAge} سال باشد.`,
            age: age
        };
    }

    return {
        isValid: true,
        message: `سن معتبر: ${age} سال`,
        age: age
    };
};
