export class User {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly createdAt: Date,
  ) {}

  static createNew(
    email: string,
    passwordHash: string,
    firstName: string,
    lastName: string,
  ): User {
    return new User('', email, passwordHash, firstName, lastName, new Date());
  }

  static rehydrate(props: {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
  }): User {
    return new User(
      props.id,
      props.email,
      props.passwordHash,
      props.firstName,
      props.lastName,
      props.createdAt,
    );
  }
}
