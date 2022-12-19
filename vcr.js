function sequence_time(unit, value) {
	if(unit != "s" && unit != "ms" && unit != "m") {
		throw new Error("Time unit should be string values of: 'ms', 's' or 'm', representing milliseconds, seconds and minutes");
	}
	return { unit, value };
}

function to_milliseconds(time_length) {
	if(time_length.hasOwnProperty("unit")) {
			switch(time_length.unit) {
			case "ms":
				return time_length.value;
				break;
			case "s":
				return time_length.value * 1000;
				break;
			case "m":
				return time_length.value * 60 * 1000;
				break;
			default:
				throw new Error("Unknown time unit: " + time_length.unit);
		}
	} else {
		throw new Error(`Parameter Object 'time_length' is not of layout: { "unit": "ms" | "s" | "m", value: number }: ${time_length}`);
	}
}

function wait(delayInMS) {
  console.log(`waiting for ${delayInMS}`);
  return new Promise((resolve) => setTimeout(resolve, delayInMS));
}

function start_recording(stream, time_length) {
	const ms = to_milliseconds(time_length);
	const options = { mimeType: "video/webm;codecs:vp8" };
	const mr = new MediaRecorder(stream, options);
	const chunks = [];
	mr.ondataavailable = (e) => chunks.push(e.data);
	mr.start();

	let stopped = new Promise((resolve, reject) => {
		mr.onstop = resolve;
		mr.onerror = (evt) => reject(evt.name);
	});

	let recorded = wait(ms).then(() => {
		if(mr.state == "recording") mr.stop();
	});

	return Promise.all([stopped, recorded])
	.then(() => chunks);
}

function grab_sequence(time, sequence_name) {
	let name = sequence_name ?? "sequence";
	let video = document.querySelector("video");
	return start_recording(video.mozCaptureStream(), time).then(data_collected => {
		let blob = new Blob(data_collected, { type: "video/webm" } );
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.style = "display: none;";
		a.href = url;
		a.download = `${name}.webm`;
		a.click();
		window.URL.revokeObjectURL(url);
	});
}

function grab_sequences(count) {
  
}

async function test() {
	const span = sequence_time("s", 5);
	let idx = 1;
	const sequences = [span, span, span]
	for(const s of sequences) {
		await grab_sequence(span, `test-${idx}`);
		idx+=1;
	}
}
