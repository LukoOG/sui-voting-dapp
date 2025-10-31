interface SuiEnv {
  versionObject: string;
  registeryObject: string;
  publisherObject: string;
  packageId: string;
  pollType: string;
}


const suiEnv: SuiEnv = {
	versionObject: process.env.NEXT_PUBLIC_VERSION_ID || "default-version",
	registeryObject: process.env.NEXT_PUBLIC_REGISTERY_ID || "default-registery",
	publisherObject: process.env.NEXT_PUBLIC_PUBLISHER_ID || "default-publisher-object",
	packageId: process.env.NEXT_PUBLIC_PACKAGE_ID || "default-package-id",
	pollType: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::poll:Poll`
};

export default suiEnv