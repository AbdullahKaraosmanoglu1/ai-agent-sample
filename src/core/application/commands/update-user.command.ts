export class UpdateUserCommand {
    constructor(
        public readonly id: string,
        public readonly dto: any,
    ) { }
}
