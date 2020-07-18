abstract class Worker {
  abstract name: string;
  abstract run();
  static perform = () => {};
}

Worker.perform = async function () {
  console.log(`Starting worker: ${this.name}`);

  const task = new this();

  try {
    return await task.run();
  } catch (err) {
    console.log(err);
  }
};

export { Worker };
