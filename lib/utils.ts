import * as bcrypt from 'bcrypt';
import dayjs from './custom-dayjs';
import { Response } from 'express';
import { MAX_AGES, TOKENS } from './constants';
import { OpeningHour } from './types';
import { PDFDocument } from 'pdf-lib';


export const hashString = async (password: string): Promise<string> => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

export const compareString = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

export const getPayrollCalendarEndDate = (start: string, duration: "Weekly" | "Monthly" | "Fortnightly"): string => {
    if (duration === "Fortnightly") return dayjs(start).add(2, 'week').format();
    return dayjs(start).add(1, duration === "Weekly" ? "week" : "month").format();
}

export const setCookie = (response: Response, { data, age, name }: { data: any, age?: number, name: string }): void => {
    response.cookie(name || TOKENS.auth_token, data, {
        ...(!JSON.parse(process.env.DEV_ENVIRONMENT) && { domain: ".akkukachasma.com" }),
        maxAge: age || MAX_AGES[TOKENS.auth_token],
        httpOnly: true,
        sameSite: "none",
        secure: true,
    })
}

export const removeCookie = (response: Response, name: string): void => {
    response.clearCookie(name || TOKENS.auth_token, {
        ...(!JSON.parse(process.env.DEV_ENVIRONMENT) && { domain: ".akkukachasma.com" })
    })
}

const getNextOpeningStatus = (openingHours: OpeningHour[]) => {
    let anotherOpeningHour: null | OpeningHour;
    let indexToNextOpeningHour: number = 0;
    for (let i = 1; i <= 7; i++) {
        const oh = openingHours.find(oh => oh.day === dayjs().add(i, 'day').format("ddd"));
        if (oh) {
            anotherOpeningHour = oh;
            indexToNextOpeningHour = i;
            break;
        }
    }

    return { value: "closed", message: `Opens on ${dayjs().add(indexToNextOpeningHour, 'day').format("dddd")} at ${anotherOpeningHour?.from}` };
}

export const getBranchStatus = (openingHours: OpeningHour[]) => {
    const oh = openingHours.find(oh => oh.day === dayjs().format("ddd"));
    if (!oh) {
        return getNextOpeningStatus(openingHours);
    }
    // check if it is opened
    const opens = dayjs(oh.from, "hh:mm a");
    const closes = dayjs(oh.to, "hh:mm a");
    const end = dayjs();


    const secondsFromOpening = end.diff(opens, 's');
    const secondsToClose = end.diff(closes, 's');

    if (secondsFromOpening > 0 && secondsToClose < 0) {
        return { value: "open", message: `Closes at ${oh.to}` }
    }

    if (secondsFromOpening < 0 && secondsToClose < 0) {
        return { value: 'closed', message: `Opens at ${oh.from}` };
    }

    if (secondsFromOpening > 0 && secondsToClose > 0) {
        return { value: 'closed', message: `Opens at ${oh.from}` }
    }
}

// collects working duration details from the querystring value
// IMPORTANT for filtering employees based on their working duration
export const transformDurationString = (str: string): any => {
    try {
        return [
            str.split(",")
                .filter((item) => item.includes("month"))
                .map((item) => Number(item.slice(0, 1))),

            str.split(",")
                .filter((item) => item.includes("year"))
                .map((item) => Number(item.slice(0, 1))),

            str.includes('5plus') ? ['5plus'] : []
        ]
    } catch (error) {
        return null;
    }
}

export const isValidDateString = (dateStr: string, format: string = "YYYY-MM-DD") => {
    return dayjs(dateStr, format, true).isValid();
}

export const calculateAverage = (data: number[]) => {
    return data.reduce((a, b) => a + b) / data.length;
}

export const getNameDetails = (name: string) => {
    const nameObj: { first_name: string, middle_name?: string; last_name: string } = {
        first_name: "",
        last_name: "",
    };
    if (name) {
        let nameArr = name?.split(" ");
        if (Array.isArray(nameArr) && nameArr.length === 1) {
            nameObj.first_name = nameArr[0];
        } else if (Array.isArray(nameArr) && nameArr.length === 2) {
            nameObj.first_name = nameArr[0];
            nameObj.last_name = nameArr[1];
        } else if (Array.isArray(nameArr) && nameArr.length === 3) {
            nameObj.first_name = nameArr[0];
            nameObj.middle_name = nameArr[1];
            nameObj.last_name = nameArr[2];
        }
    }

    return nameObj;
};

export const isDateInRange = (start_date: string | Date, end_date: string | Date, date: string | Date): boolean => {
    const startDate = dayjs.utc(dayjs(start_date).format("YYYY-MM-DD"));
    const endDate = dayjs.utc(dayjs(end_date).format("YYYY-MM-DD"));
    const dateToCheck = dayjs.utc(dayjs(date).format("YYYY-MM-DD"));
    return dateToCheck.isSameOrAfter(startDate) && dateToCheck.isSameOrBefore(endDate);
}

export const getDatesBetweenDates = (start: Date = dayjs().toDate(), end: Date = dayjs().toDate()) => {
    try {
        const startDate = dayjs(start);
        const endDate = dayjs(end);
        const datesArray = [];

        let currentDate = startDate;
        while (currentDate.isSameOrBefore(endDate)) {
            datesArray.push(currentDate.format("YYYY-MM-DD"));
            currentDate = currentDate.add(1, 'day');
        }

        return datesArray;
    } catch (error) {
        return [];
    }
}
export const getContractExpiryDate = ({ start_work, type, duration }: { start_work: Date, type: "month" | "year" | "week", duration: number }) => {
    try {
        const date = dayjs(start_work).add(duration, type).format();
        if (date === "Invalid Date") {
            throw new Error("Invalid arguements provided");
        }
        return dayjs(date).toDate();
    } catch (error) {
        return null;
    }
};

export const base64ToUint8Array = (base64: string) => {
    const raw = atob(base64.split(',')[1]);
    const uint8Array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
        uint8Array[i] = raw.charCodeAt(i);
    }
    return uint8Array;
}

export type Signature = {
    full_name?: string;
    signature: string;
}

type StampSignatureOnPdf = {
    pdfBuffer: any,
    signature: Signature[];
    name: string;
}

export const stampSignatureOnPdf = async ({ pdfBuffer, signature, name }: StampSignatureOnPdf): Promise<{ name: string; type: string; file: any } | null> => {
    try {
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const page = pdfDoc.getPage(pdfDoc.getPageCount() - 1);
        const { width, height } = page.getSize();
        page.setHeight(height + 100);
        const fileName = "signed_" + name;
        let pdfBytes: any = null;

        if (signature.length > 1) {
            const signByte1 = await pdfDoc.embedPng(signature[0].signature);
            const signByte2 = await pdfDoc.embedPng(signature[1].signature);

            page.drawImage(signByte1, {
                x: width - 280,
                y: 80,
                width: 120,
                height: 50,
            });
            page.drawText(signature[0].full_name, {
                x: width - 280,
                y: 50,
                size: 12
            })

            page.drawImage(signByte2, {
                x: width - 130,
                y: 80,
                width: 120,
                height: 50,
            });

            page.drawText(signature[1].full_name, {
                x: width - 130,
                y: 50,
                size: 12
            })

            pdfBytes = await pdfDoc.save();
        } else {
            const signByte1 = await pdfDoc.embedPng(signature[0].signature);

            page.drawImage(signByte1, {
                x: width - 130,
                y: 80,
                width: 120,
                height: 50,
            });

            page.drawText(signature[0].full_name, {
                x: width - 130,
                y: 50,
                size: 12,
            })

            pdfBytes = await pdfDoc.save();
        }

        return { name: fileName, type: "signed_document", file: Buffer.from(pdfBytes) };
    } catch (error) {
        console.log({ error })
        return null;
    }
}
