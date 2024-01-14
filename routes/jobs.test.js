"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");
const jwt = require("jsonwebtoken");




const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new",
    salary: 100,
    equity: "0",
    company_handle: "c1"
  };

  test("ok for users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(
            {
                title: "new",
                salary: 100,
                equity: 0,
                company_handle: "c1"
            }
        )
        .set("authorization", `Bearer ${u2Token}`);
        
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: newJob,
    });
  });

  test("Admin authorization false: return 401", async function(){
    const resp = await request(app)
    .post("/jobs")
    .send(
        {
            title: "new",
            salary: 100,
            equity: 0,
            company_handle: "c1"
        }
    )
    .set("authorization", `Bearer ${u1Token}`);
expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "new",
          salary: 10,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          ...newJob,
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
            {
                title: "new1",
                salary: 1,
                equity: "1",
                company_handle: "c1"
            },
            {
                title: "new2",
                salary: 2,
                equity: "0.2",
                company_handle: "c2"
            },
            {
                title: "new3",
                salary: 3,
                equity: "0.3",
                company_handle: "c3"
            },
          ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:handle */

describe("GET /jobs/:title", function () {
  test("works for anon", async function () {
    const resp = await request(app)
    .get(`/jobs/new1`);
    expect(resp.body).toEqual({
      job: {
        title: "new1",
        salary: 1,
        equity: "1",
        company_handle: "c1"
      },
    });
  });

  test("works for anon: jobs w/o jobs", async function () {
    const resp = await request(app).get(`/jobs/new2`);
    expect(resp.body).toEqual({
      job: {
        title: "new2",
        salary: 2,
        equity: "0.2",
        company_handle: "c2"
      },
    });
  });

  test("not found for no such jobs", async function () {
    const resp = await request(app).get(`/jobs/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:handle */

describe("PATCH /jobs/:title", function () {
  test("works for users", async function () {
    const resp = await request(app)
        .patch(`/jobs/new1`)
        .send({
          title: "brandnew",
          salary: 122,
          equity: 0.2,
        })
        .set("authorization", `Bearer ${u2Token}`);

    expect(resp.body).toEqual({
      jobs: {
        title: "brandnew",
        salary: 122,
        equity: 0.2,
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/new1`)
        .send({
          title: "C1-new",
          salary: 122,
          equity: 0.2,
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such jobs", async function () {
    const resp = await request(app)
        .patch(`/jobs/nope`)
        .send({
          name: "new nope",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on title change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/c1`)
        .send({
          title: "new",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/new1`)
        .send({
          title: "not-a-url",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:handle */

describe("DELETE /jobs/:title", function () {
  test("works for users", async function () {
    const resp = await request(app)
        .delete(`/jobs/new1`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({ deleted: "new1" });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/new1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such jobs", async function () {
    const resp = await request(app)
        .delete(`/jobs/nope`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
