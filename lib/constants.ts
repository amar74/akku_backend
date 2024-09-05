
// update all the token value related types defined in this file
export const TOKENS = {
    auth_token: "_akat",
    refresh_token: "_akrt",
};
export const TOKEN_VALUES = ["_akat", "_akrt"];
export type TokensType = {
    _akat: string;
    _akrt: string;
}

// IMPORTANT: match the times in both MAX_AGES and TOKEN_EXPIRATIONS
export const MAX_AGES = {
    [TOKENS.auth_token]: 1000 * 60 * 30, // 30 minutes
    [TOKENS.refresh_token]: 1000 * 60 * 60 * 24 * 60, // 60 days
};

export const TOKEN_EXPIRATIONS = {
    [TOKENS.auth_token]: "30m",
    [TOKENS.refresh_token]: "60d",
};


export const PATTERNS = {
    mobile_number: /^(\+?61)?0?([2-8]\d{8})$/,
    hex_color: /^(\#([a-fA-F0-9]{3}){1,2}|(rgb|hsl)\(\s*\d+%?\s*,\s*\d*%?\s*,\s*\d*%?\s*\))$/,
    time_in_ampm: /.*:(?:.*am|.* pm)$/,
};


// this is used in refresh-token controller
export const REFRESHABLE_TOKEN_TYPES_ARRAY = [TOKENS.auth_token];
export type REFRESHABLE_TOKEN_TYPES = "_akat";

export type TOKEN_DATA = {
    value?: string;
    life?: number;
    type?: REFRESHABLE_TOKEN_TYPES;
}