"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a Job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * Throws BadRequestError if Job already in database.
   * */

  static async create({ title, salary, equity, company_handle}) {
    const duplicateCheck = await db.query(
          `SELECT title, id
           FROM jobs
           WHERE title = $1`,
        [title]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate job: ${title}`);

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle`,
        [
            title, salary, equity, company_handle
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           ORDER BY title`);
    return jobsRes.rows;
  }
  /** Filters
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * */



  /** Given a job title, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(req) {
    const jobsRes = await db.query(
          `SELECT  id, title, salary, equity, company_handle,
           FROM jobs
           WHERE title = $1`,
        [req]);

    const job = jobsRes.rows[0];

    console.log(job)

    if (!job) throw new NotFoundError(`No job: ${req}`);

    return job;
  }


static async search(id){
  const job = await db.query(`
  SELECT *
  FROM jobs
  WHERE id = $1
  
  `,[id])

  return job.rows[0]

}


  static async filter(req) {
    if(req.title){
      const jobsResult = await db.query(`
      SELECT *
      FROM jobs
      WHERE title LIKE  '%'||$1||'%'
      `,[req.title]);
      return jobsResult.rows
    } else if(req.min){
      const jobsResult = await db.query(`
      SELECT *
      FROM jobs
      WHERE salary >= $1
      `,[req.min])
      return jobsResult.rows

    }else if(req.hasEquity){
      if(req.hasEquity === null || req.hasEquity === 0) return this.get(req);
      const jobsResult = await db.query(`
      SELECT *
      FROM jobs
      WHERE hasEquity != null
      `,[req.hasEquity])
      return jobsResult.rows
    }

  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data);
        const handleVarIdx = "$" + (values.length + 1);
    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id =${handleVarIdx} 
                      RETURNING id,
                                title, 
                                salary, 
                                equity, 
                                 company_handle,`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(title) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE title = $1
           RETURNING title`,
        [title]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);
  }
}


module.exports = Job;
