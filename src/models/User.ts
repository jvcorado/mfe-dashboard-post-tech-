export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export class UserModel {
    public id: number;
    public name: string;
    public email: string;
    public email_verified_at: string | null;
    public created_at: string;
    public updated_at: string;

    constructor(data: User) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.email_verified_at = data.email_verified_at;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static fromJSON(data: User): UserModel {
        return new UserModel(data);
    }

    toJSON(): User {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            email_verified_at: this.email_verified_at,
            created_at: this.created_at,
            updated_at: this.updated_at,
        };
    }
} 