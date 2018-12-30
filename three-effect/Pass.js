
export default function Pass() {
	this.enabled = true; // if set to true, the pass is processed by the composer
	this.needsSwap = true; // if set to true, the pass indicates to swap read and write buffer after rendering
	this.clear = false; // if set to true, the pass clears its buffer before rendering
	this.renderToScreen = false; // if set to true, the result of the pass is rendered to screen
};

Object.assign(Pass.prototype, {
	setSize: function(width, height) {},

	render: function (renderer, writeBuffer, readBuffer, delta, maskActive) {
		console.error('THREE.Pass: .render() must be implemented in derived pass.');
	}
});
