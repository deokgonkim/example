
/**
 * 어떤 클래서
 */
export class SomeEntity {
    id: number;
    name: string;

    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;

    constructor(partial: Partial<SomeEntity>) {
        Object.assign(this, partial);
    }
}

/**
 * 이것은 인터페이스이다.
 */
export interface ISomeInterface {
    name: string;

    hobby: string;
}

/**
 * 문자열을 반환한다.
 * @param name
 * @returns
 */
export const someFunction = (name: string) => {
    return `This is result of someFunction ${name}`;
}

/**
 * 이름을 반환한다.
 * @param arg
 * @returns
 */
export const otherFunction = (arg: SomeEntity): string => {
    return arg.name;
}

/**
 * 하비를 반환한다.
 * @param arg
 * @returns
 */
export const returnHobby = (arg: ISomeInterface): string => {
    return arg.hobby;
}

// exporting child entities
export * from "./entities/index";
