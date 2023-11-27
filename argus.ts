type MT_OPTION = string | number;
type MT_RESULT = string;

export function match(target: number | string): NUM_Matcher | STR_Matcher {
  return typeof target === "number" ?
    new NUM_Matcher(new Map(), null, target) :
    new STR_Matcher(new Map(), null, target);
}

interface Matcher<out T> {
  with(option: any, result: any): Matcher<T>;
  otherwise(result: any): any;
}

abstract class MatcherBase<T> implements Matcher<T> {
  constructor(
    protected options: Map<T, MT_RESULT>,
    protected default_result: any = null,
    protected target: T
  ) { }

  protected run(): any {
    if (!this.target) throw new Error("Target is null");
    if (!this.options.size) return this.default_result;
  }

  resolve(result_generator: any) {
    if (typeof result_generator === "string" ||
      typeof result_generator === "number") return result_generator;
    if (typeof result_generator === "function")
      return (result_generator as Function)(this.target);

    return this.default_result;
  }

  public with(option: any, result: any): Matcher<T> {
    this.options.set(option, result);
    return this as Matcher<T>;
  }

  public otherwise(result: any): any {
    this.default_result = result;
    return this.run();
  }
}

class NUM_Matcher extends MatcherBase<number> {
  constructor(
    options: Map<number, any>,
    default_result: any = null,
    target: number
  ) {
    super(options, default_result, target);
  }

  override run(): any {
    super.run();
    const result_generator = this.options.get(this.target);
    if (!result_generator) return this.default_result;
    return super.resolve(result_generator);
  }
}

class STR_Matcher extends MatcherBase<string> {
  constructor(
    options: Map<string, MT_RESULT>,
    default_result: any = null,
    target: string
  ) {
    super(options, default_result, target);
  }

  override run(): any {
    super.run();
    return this.options.has(this.target) ?
      this.options.get(this.target) : this.default_result;
  }
}
