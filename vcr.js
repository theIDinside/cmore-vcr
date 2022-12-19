const kilobyte = (kb_) => Math.round(kb_ * 1024);
const megabyte = (mb_) => kilobyte(mb_) * 1024;

function start_recording(stream, minimum_bytes_to_collect) {
  return new Promise(async (resolve, reject) => {
    const options = { mimeType: "video/webm;codecs:vp8" };
    const mr = new MediaRecorder(stream, options);
    const chunks = [];
    let total_size = 0;
    mr.ondataavailable = (e) => {
      const blob = e.data;
      total_size += blob.size;
      console.log(`Blob size: ${blob.size} (${total_size}/${minimum_bytes_to_collect}) of mime-type: ${blob.type}`);
      chunks.push(blob);
      if(total_size >= minimum_bytes_to_collect) {
        if(mr.state == "recording") {
          mr.stop();
        }
      }
    };
    mr.start();
    mr.onstop = () => {
      resolve(chunks);
    };
    mr.onerror = (evt) => reject(evt.name);
    while(total_size < minimum_bytes_to_collect) {
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 2000);
      }).then(() => {
        if(mr.state == "recording") {
          mr.requestData();
        }
      });
    }
  });
}

function grab_sequence(sequence_name, minimum_bytes_to_collect) {
  console.log(`Grabbing ${minimum_bytes_to_collect} (minimum) bytes`);
  let name = sequence_name ?? "sequence";
  let video = document.querySelector("video");
  return start_recording(video.mozCaptureStream(), minimum_bytes_to_collect).then(data_collected => {
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

/**
 * Grab `sequences` of sequences of size `megabytes`
 * @param {number} sequences
 * @param {number} megabytes
 */
async function grab_stream(sequences, megabytes) {
  for(let idx = 0; idx < sequences; idx += 1) {
    await grab_sequence(`test-${idx}`, megabyte(megabytes));
  }
}