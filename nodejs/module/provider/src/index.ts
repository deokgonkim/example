
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
