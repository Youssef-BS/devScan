export type AuthContextType = {
    admin: { email: string; role: "ADMIN" } | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
};