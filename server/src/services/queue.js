import logger from '../utils/logger.js';


class JobQueue {
  constructor({ concurrency = 3, maxRetries = 3 } = {}) {
    this.concurrency = concurrency;
    this.maxRetries = maxRetries;
    this.queue = [];
    this.active = 0;
    this.handlers = new Map();
  }

  
  on(type, handler) {
    this.handlers.set(type, handler);
  }

  
  enqueue(type, data) {
    const job = {
      id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      data,
      attempts: 0,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };
    this.queue.push(job);
    logger.info('Job enqueued', { jobId: job.id, type });
    this._processNext();
    return job.id;
  }

  
  async _processNext() {
    while (this.active < this.concurrency && this.queue.length > 0) {
      const job = this.queue.shift();
      this.active++;
      this._executeJob(job);
    }
  }

  async _executeJob(job) {
    const handler = this.handlers.get(job.type);
    if (!handler) {
      logger.error('No handler for job type', { type: job.type });
      this.active--;
      this._processNext();
      return;
    }

    job.attempts++;
    job.status = 'processing';
    logger.info('Job processing', { jobId: job.id, attempt: job.attempts });

    try {
      await handler(job.data, job);
      job.status = 'completed';
      logger.info('Job completed', { jobId: job.id });
    } catch (error) {
      logger.error('Job failed', { jobId: job.id, error: error.message, attempt: job.attempts });

      if (job.attempts < this.maxRetries) {
        
        const delay = Math.pow(2, job.attempts - 1) * 1000;
        job.status = 'retrying';
        setTimeout(() => {
          this.queue.push(job);
          this._processNext();
        }, delay);
      } else {
        job.status = 'failed';
        logger.error('Job exhausted retries', { jobId: job.id });
      }
    } finally {
      this.active--;
      this._processNext();
    }
  }

  
  getStatus() {
    return {
      queued: this.queue.length,
      active: this.active,
      concurrency: this.concurrency,
    };
  }
}

const reviewQueue = new JobQueue({ concurrency: 3, maxRetries: 3 });

export default reviewQueue;
