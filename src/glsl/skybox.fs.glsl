uniform samplerCube skybox;
out vec4 out_FragColor;
in vec3 wcsPosition;

void main() {
	vec4 textureColour = texture(skybox, normalize(wcsPosition));
	out_FragColor = vec4(vec3(textureColour), 1.0);
}