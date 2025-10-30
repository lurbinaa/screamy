export class InitializableClass {
    protected _initialized = false;
}

export function requiresInit<This extends InitializableClass, Args extends unknown[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
) {
    const methodName = String(context.name);

    return function (this: This, ...args: Args): Return {
        if (!this._initialized) {
            throw new Error(`Method "${methodName}" requires init() to be called first`);
        }

        return target.call(this, ...args);
    };
}

export function requiresInitGetter<This extends InitializableClass, Return>(
    target: (this: This) => Return,
    context: ClassGetterDecoratorContext<This, Return>
) {
    const getterName = String(context.name);

    return function (this: This): Return {
        if (!this._initialized) {
            throw new Error(`Getter "${getterName}" requires init() to be called first`);
        }

        return target.call(this);
    };
}