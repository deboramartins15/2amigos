"use strict";

const Status = use("App/Models/Status");

class StatusController {
  async index({ response }) {
    try {
      return await Status.all();
    } catch (error) {
      return response.status(error.status).send(error);
    }
  }
}

module.exports = StatusController;
