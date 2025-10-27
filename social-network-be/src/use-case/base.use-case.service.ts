export abstract class BaseUseCaseService<TInput, TOutput> {
  abstract execute(input: TInput): Promise<TOutput>;
}
