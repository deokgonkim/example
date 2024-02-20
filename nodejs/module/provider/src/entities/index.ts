
/**
 * 클래스 엔티티
 */
export class ClassEntity {
    id: number;
    name: string;

    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;

    constructor(partial: Partial<ClassEntity>) {
        Object.assign(this, partial);
    }
}

/**
 * 인터페이스
 */
export interface IInterfaceOfClass {
    name: string;
}
