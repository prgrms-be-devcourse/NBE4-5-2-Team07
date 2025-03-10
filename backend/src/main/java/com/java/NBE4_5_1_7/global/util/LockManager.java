package com.java.NBE4_5_1_7.global.util;

import java.util.concurrent.TimeUnit;

import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;

public class LockManager {

	private final RedissonClient redissonClient;

	public LockManager(RedissonClient redissonClient) {
		this.redissonClient = redissonClient;
	}

	public RLock getLock(String lockKey) {
		return redissonClient.getLock(lockKey);
	}

	public void acquireLock(RLock lock, long waitTime, long leaseTime) throws InterruptedException {
		if (!lock.tryLock(waitTime, leaseTime, TimeUnit.SECONDS)) {
			throw new RuntimeException("잠시 후 다시 시도해주세요.");
		}
	}

	public void releaseLock(RLock lock) {
		if (lock.isHeldByCurrentThread()) {
			lock.unlock();
		}
	}
}
