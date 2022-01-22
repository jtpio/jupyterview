import {
  WorkerAction,
  IWorkerMessage,
  MainAction,
  IMainMessage,
  IDict
} from '../types';
import WorkerHandler from './actions';

let ports: IDict<MessagePort> = {};
let lock = false;

const registerWorker = async (id: string, port: MessagePort) => {
  if (!lock) {
    lock = true;
    ports[id] = port;
    for (const id of Object.keys(ports)) {
      sendToMain({ action: MainAction.INITIALIZED, payload: false }, id);
    }
  } else {
    ports[id] = port;
    if (true) {
      sendToMain({ action: MainAction.INITIALIZED, payload: false }, id);
    }
  }
};

const sendToMain = (msg: IMainMessage, id: string) => {
  if (id in ports) {
    ports[id].postMessage(msg);
  }
};

self.onmessage = async (event: MessageEvent): Promise<void> => {
  const message = event.data as IWorkerMessage;
  const { id } = message;
  switch (message.action) {
    case WorkerAction.REGISTER: {
      const port = event.ports[0];
      await registerWorker(id, port);
      break;
    }
    case WorkerAction.LOAD_FILE: {
      const result = await WorkerHandler[message.action](message.payload);
      sendToMain(
        {
          action: MainAction.DISPLAY_SHAPE,
          payload: result
        },
        id
      );
      break;
    }
  }
};
