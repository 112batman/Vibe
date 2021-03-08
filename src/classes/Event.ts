import Client from "./Client";

export default abstract class Event {
    abstract name: string
    abstract type: string
    abstract once: boolean = false

    constructor(protected bot: Client) {}

    abstract run(...args: any[]): Promise<any>

    public async exec(...args: any[]): Promise<void> {
        await this.run(...args)
    }
}