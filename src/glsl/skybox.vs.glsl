uniform vec3 cameraPos;
out vec3 wcsPosition;

void main() {
	wcsPosition = vec3(modelMatrix * vec4(position, 1.0));
	gl_Position = projectionMatrix * viewMatrix * vec4(wcsPosition, 1.0);
}