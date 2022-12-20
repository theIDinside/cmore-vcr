A VCR-like capability for recording CMore video while watching it.

I shouldn't have to remind you that sharing files are illegal.

For this to work, you also need some minor programming skills.

# Building firefox

First of all you need to download Firefox source and build it.
A quick reference can be found [here](https://firefox-source-docs.mozilla.org/contributing/contribution_quickref.html#firefox-contributors-quick-reference)

Before building firefox you have to make this change to the member function
```cpp
HTMLMediaElement::CanBeCaptured(StreamCaptureType aCaptureType) {
	// Don't bother capturing when the document has gone away
	nsPIDOMWindowInner* window = OwnerDoc()->GetInnerWindow();
	if (!window) {
		return false;
	}

	// Prevent capturing restricted video
	if (aCaptureType == StreamCaptureType::CAPTURE_ALL_TRACKS &&
		ContainsRestrictedContent()) {
		return false; // (CHANGE THIS) <- either uncomment this line, or return true here
	}
	return true;  
}
```

Doing this, we can use the [MediaRecorder Web API in Javascript](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder).

This essentially just dumps the blobs of bytes that a video with audio contains, to disk. For some reason, this has been restricted by Firefox (and google chrome). There's nothing inherently wrong with capturing this video. There's plenty of screen recording software that can do this for you, without this fix, but those are heavy weight and will certainly be a pain to use when working on other stuff.

Once you've made the above change and built firefox from source, you can now use the Javascript provided by this repo.
