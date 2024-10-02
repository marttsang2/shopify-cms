export type Company = {
    id: string;
    name: string;
    address1: string;
    address2: string | null;
    city: string;
    province: string;
};

export type Customer = {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    email: string;
    phone: string;
    companies: Company[];
};
