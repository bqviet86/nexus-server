const test = async () => {
    const worker = (await import('worker_threads')).default
    const count = 10_000_000_000

    for (let i = 0; i < 10_000_000_000; i++) {
        if (i === count - 1) {
            console.log('Done')
        }
    }

    worker.parentPort?.postMessage({ msg: 'Done' })
}

test()
