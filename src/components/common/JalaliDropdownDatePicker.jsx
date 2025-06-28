import React, { useState, useEffect, useMemo, useRef } from 'react';
import moment from 'moment-jalaali';

const JalaliDropdownDatePicker = ({ value, onChange, className, disabled, placeholder }) => {
    const [selectedJDay, setSelectedJDay] = useState('');
    const [selectedJMonth, setSelectedJMonth] = useState('');
    const [selectedJYear, setSelectedJYear] = useState('');
    const [conversionError, setConversionError] = useState('');
    const isUpdatingFromProp = useRef(false);

    const months = [
        { value: 1, label: 'فروردین' },
        { value: 2, label: 'اردیبهشت' },
        { value: 3, label: 'خرداد' },
        { value: 4, label: 'تیر' },
        { value: 5, label: 'مرداد' },
        { value: 6, label: 'شهریور' },
        { value: 7, label: 'مهر' },
        { value: 8, label: 'آبان' },
        { value: 9, label: 'آذر' },
        { value: 10, label: 'دی' },
        { value: 11, label: 'بهمن' },
        { value: 12, label: 'اسفند' },
    ];

    const years = useMemo(() => {
        const endYear = moment().jYear();
        const startYear = endYear - 100;
        const yearsArray = [];
        for (let i = endYear; i >= startYear; i--) {
            yearsArray.push(i);
        }
        return yearsArray;
    }, []);

    const daysInMonth = useMemo(() => {
        return Array.from({ length: 31 }, (_, i) => i + 1);
    }, []);

    // تابع کمکی برای تبدیل اعداد فارسی به انگلیسی
    const convertPersianToEnglish = (str) => {
        if (!str) return str;
        const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        let result = str.toString();
        for (let i = 0; i < persianNumbers.length; i++) {
            result = result.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
        }
        return result;
    };

    // Effect برای تنظیم dropdown ها بر اساس value ورودی
    useEffect(() => {
        console.log("JalaliDropdownDatePicker useEffect[value] triggered. Value:", value);
        setConversionError('');

        if (value && value.trim() !== '') {
            const englishValue = convertPersianToEnglish(value);
            console.log("Converted value:", englishValue);

            // استفاده صحیح از moment برای تبدیل تاریخ میلادی به شمسی
            const m = moment(englishValue, 'YYYY-MM-DD');
            if (m.isValid()) {
                isUpdatingFromProp.current = true;
                const jDay = m.jDate();
                const jMonth = m.jMonth() + 1;
                const jYear = m.jYear();

                console.log("Setting jalali values:", jDay, jMonth, jYear);
                setSelectedJDay(jDay);
                setSelectedJMonth(jMonth);
                setSelectedJYear(jYear);
                isUpdatingFromProp.current = false;
            } else {
                console.log("Invalid value, resetting");
                isUpdatingFromProp.current = true;
                setSelectedJDay('');
                setSelectedJMonth('');
                setSelectedJYear('');
                isUpdatingFromProp.current = false;
            }
        } else {
            console.log("Empty value, resetting");
            isUpdatingFromProp.current = true;
            setSelectedJDay('');
            setSelectedJMonth('');
            setSelectedJYear('');
            isUpdatingFromProp.current = false;
        }
    }, [value]);

    // تابع برای بررسی و ارسال تاریخ تبدیل شده
    const emitDate = (day, month, year) => {
        // جلوگیری از حلقه بی‌نهایت
        if (isUpdatingFromProp.current) {
            return;
        }

        setConversionError('');

        if (day !== '' && month !== '' && year !== '') {
            const dayNum = parseInt(day);
            const monthNum = parseInt(month);
            const yearNum = parseInt(year);

            if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum)) {
                try {
                    // استفاده صحیح از moment-jalaali برای ساخت تاریخ شمسی
                    const jDateString = `${yearNum}/${monthNum.toString().padStart(2, '0')}/${dayNum.toString().padStart(2, '0')}`;
                    const m = moment(jDateString, 'jYYYY/jMM/jDD');

                    if (m.isValid()) {
                        const gregorianOutput = m.format('YYYY-MM-DD');
                        console.log("Valid gregorian date:", gregorianOutput);
                        onChange(gregorianOutput);
                    } else {
                        const monthName = months.find(m => m.value === monthNum)?.label || monthNum;
                        const errorMessage = `تاریخ ${dayNum} ${monthName} ${yearNum} معتبر نیست`;
                        setConversionError(errorMessage);
                        console.log("Invalid jalali date combination:", errorMessage);
                        onChange('');
                    }
                } catch (error) {
                    console.error("Error creating jalali date:", error);
                    const monthName = months.find(m => m.value === monthNum)?.label || monthNum;
                    const errorMessage = `تاریخ ${dayNum} ${monthName} ${yearNum} معتبر نیست`;
                    setConversionError(errorMessage);
                    onChange('');
                }
            } else {
                console.log("Invalid number values:", dayNum, monthNum, yearNum);
                onChange('');
            }
        } else {
            console.log("Incomplete selection");
            onChange('');
        }
    };

    const handleDayChange = (e) => {
        const newDay = e.target.value === '' ? '' : parseInt(e.target.value);
        console.log("Day changed to:", newDay);
        setSelectedJDay(newDay);
        emitDate(newDay, selectedJMonth, selectedJYear);
    };

    const handleMonthChange = (e) => {
        const newMonth = e.target.value === '' ? '' : parseInt(e.target.value);
        console.log("Month changed to:", newMonth);
        setSelectedJMonth(newMonth);
        emitDate(selectedJDay, newMonth, selectedJYear);
    };

    const handleYearChange = (e) => {
        const newYear = e.target.value === '' ? '' : parseInt(e.target.value);
        console.log("Year changed to:", newYear);
        setSelectedJYear(newYear);
        emitDate(selectedJDay, selectedJMonth, newYear);
    };

    return (
        <div className={`jalali-datepicker-dropdowns ${className || ''}`}>
            <select
                value={selectedJDay}
                onChange={handleDayChange}
                disabled={disabled}
                className={`date-dropdown day-dropdown form-control ${!selectedJDay && placeholder ? 'placeholder-selected' : ''}`}
            >
                <option value="">{placeholder || 'روز'}</option>
                {daysInMonth.map(day => (
                    <option key={day} value={day}>{day}</option>
                ))}
            </select>

            <select
                value={selectedJMonth}
                onChange={handleMonthChange}
                disabled={disabled}
                className={`date-dropdown month-dropdown form-control ${!selectedJMonth && placeholder ? 'placeholder-selected' : ''}`}
            >
                <option value="">{placeholder || 'ماه'}</option>
                {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                ))}
            </select>

            <select
                value={selectedJYear}
                onChange={handleYearChange}
                disabled={disabled}
                className={`date-dropdown year-dropdown form-control ${!selectedJYear && placeholder ? 'placeholder-selected' : ''}`}
            >
                <option value="">{placeholder || 'سال'}</option>
                {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>

            {conversionError && (
                <div className="conversion-error" style={{
                    color: '#dc3545',
                    fontSize: '12px',
                    marginTop: '4px',
                    fontFamily: 'inherit'
                }}>
                    {conversionError}
                </div>
            )}
        </div>
    );
};

export default JalaliDropdownDatePicker;