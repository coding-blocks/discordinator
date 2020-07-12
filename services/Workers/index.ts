abstract class Worker {
  abstract run();
  static perform = () => {};
}

Worker.perform = function () {
  const task = new this();

  task.run();
};

export { Worker };
