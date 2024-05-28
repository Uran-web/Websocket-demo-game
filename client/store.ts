type Listener<T> = (state: T) => void

export default class Store<T> {
    private state: T
    private listeners: Listener<T>[]

    constructor(initialState: T) {
        this.state = initialState,
        this.listeners = []
    }

    getState(): T {
        return this.state
    }

    setState(newState: Partial<T>): void {
        this.state = {
            ...this.state,
            ...newState
        }
        this.notify()
    }

    subscribe(listener: Listener<T>): () => void {
        this.listeners.push(listener)
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener)
        }
    }

    notify(): void {
        this.listeners.forEach(listener => listener(this.state))
    }
}

type AppState = {
    authenticated: boolean;
    clientId?: string;
    competitors: { id: number; nick_name: string }[];
};

const initialState: AppState = {
    authenticated: false,
    competitors: [],
};
