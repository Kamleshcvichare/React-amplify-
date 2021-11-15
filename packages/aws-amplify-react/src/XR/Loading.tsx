/*
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import * as React from 'react';
import * as AmplifyUI from '@aws-amplify/ui';

import { sumerianScene } from '../Amplify-UI/data-test-attributes';

export const Loading = (props) => {
	return (
		<div className={AmplifyUI.loadingOverlay} data-test={sumerianScene.loading}>
			<div className={AmplifyUI.loadingContainer}>
				<div
					className={AmplifyUI.loadingLogo}
					data-test={sumerianScene.loadingLogo}
				>
					<svg viewBox="0 0 800 481" xmlns="http://www.w3.org/2000/svg">
						<g id="Page-1" fillRule="evenodd">
							<g
								id="AWS_logo_RGB-(1)"
								transform="translate(-16 -17)"
								fillRule="nonzero"
							>
								<path
									d="M241.371,190.172 C241.371,197.487 241.371,204.801 245.028,212.115 C245.028,219.43 248.685,226.744 252.343,234.058 C252.343,234.058 252.343,237.715 256,241.373 C256,245.03 252.343,248.688 252.343,248.688 L234.058,256.002 C230.401,256.002 230.401,259.659 226.743,259.659 C223.085,259.659 219.428,259.659 219.428,256.002 C219.428,252.345 212.113,248.687 208.457,245.031 C208.457,237.716 204.8,234.06 201.142,226.745 C182.856,248.688 153.599,263.317 124.342,263.317 C106.057,263.317 84.114,256.002 69.485,245.031 C54.856,230.402 51.2,212.116 51.2,193.831 C51.2,171.888 58.515,153.603 73.143,138.974 C91.428,124.345 113.371,117.031 138.972,117.031 C149.943,117.031 157.258,117.031 168.229,120.688 C179.2,120.688 186.515,124.345 197.486,128.003 L197.486,106.06 C197.486,91.431 193.829,76.803 186.515,62.174 C171.886,54.859 157.258,51.203 142.629,51.203 C131.658,51.203 124.344,51.203 113.372,54.86 C102.4,58.517 95.087,62.175 84.115,65.832 C80.458,65.832 76.801,69.489 73.143,69.489 L69.486,69.489 C65.829,69.489 62.171,65.832 62.171,62.174 L62.171,47.545 C62.171,43.888 62.171,40.23 65.828,36.574 C69.485,36.574 73.142,32.917 73.142,32.917 C84.114,29.26 95.085,25.603 109.714,21.946 C124.343,18.289 138.971,18.289 149.942,18.289 C175.542,14.632 201.142,21.946 219.428,36.574 C234.057,54.859 245.028,76.802 241.371,102.403 L241.371,190.175 L241.371,190.172 Z M131.657,230.4 C142.628,230.4 149.942,230.4 160.914,226.743 C171.886,223.086 179.199,215.772 186.514,208.457 C190.171,204.8 193.829,197.486 193.829,193.828 C197.486,182.857 197.486,175.543 197.486,168.228 L197.486,157.257 C190.171,157.257 182.857,153.6 171.886,153.6 C164.571,153.6 153.6,153.6 146.286,153.6 C135.315,149.943 120.686,153.6 109.714,160.915 C98.742,168.23 95.085,179.2 95.085,190.172 C95.085,201.143 98.742,212.115 106.057,219.429 C113.372,226.743 124.342,230.4 131.657,230.4 Z M347.428,259.657 C343.771,259.657 340.113,259.657 336.457,256 C332.801,252.343 332.8,248.685 332.8,245.029 L270.629,40.229 C270.629,36.572 266.972,32.914 266.972,29.258 C266.972,29.258 266.972,25.601 266.972,25.601 C266.972,25.601 270.629,21.944 270.629,25.601 L296.229,25.601 C299.886,25.601 303.544,25.601 307.2,29.258 C310.857,29.258 314.515,32.915 314.515,36.573 L358.4,212.116 L402.285,36.573 C402.285,32.916 405.942,29.259 405.942,25.602 C409.599,21.945 413.257,21.945 416.913,21.945 L438.856,21.945 C442.513,21.945 446.171,21.945 449.827,25.602 C453.483,29.259 453.484,32.917 453.484,36.573 L493.712,215.773 L541.255,36.573 C541.255,32.916 544.912,29.259 544.912,25.602 C548.569,21.945 552.226,21.945 555.883,21.945 L581.483,21.945 C581.483,21.945 585.14,21.945 585.14,21.945 C585.14,21.945 588.797,25.602 585.14,25.602 C585.14,25.602 585.14,29.259 585.14,29.259 C585.14,32.916 585.14,32.916 581.483,36.573 L515.655,241.373 C515.655,245.03 511.998,248.688 508.34,252.344 C504.682,256 501.025,256.001 497.369,256.001 L475.426,256.001 C471.769,256.001 468.111,256.001 464.455,252.344 C460.799,248.687 460.798,245.029 460.798,241.373 L427.884,73.145 L387.656,245.031 C387.656,248.688 383.999,252.346 383.999,256.002 C380.342,259.659 376.684,259.659 373.028,259.659 L347.428,259.659 L347.428,259.657 Z M687.543,266.971 C672.914,266.971 658.286,266.971 647.314,263.314 C636.342,259.657 625.371,255.999 618.057,252.343 C610.743,248.686 607.086,245.028 607.086,237.714 L607.086,223.085 C607.086,215.77 610.743,215.77 614.4,215.77 C614.4,215.77 618.057,215.77 618.057,215.77 L625.371,219.427 C636.342,223.084 643.656,226.742 654.628,230.398 C665.6,234.054 676.571,234.055 687.542,234.055 C702.171,234.055 713.142,230.398 727.771,226.74 C735.085,223.083 742.4,212.111 742.4,201.14 C742.4,193.825 738.743,186.511 735.086,182.855 C727.772,175.54 716.801,171.884 705.829,168.226 L665.6,157.255 C650.971,153.598 636.343,142.626 625.372,131.655 C618.058,120.683 610.743,106.055 610.743,91.427 C610.743,80.455 614.4,69.484 618.057,62.17 C621.714,54.856 629.028,47.541 636.342,40.227 C643.656,32.912 654.627,29.256 661.942,25.598 C672.913,21.941 683.885,21.941 694.856,21.941 C702.17,21.941 705.827,21.941 713.141,21.941 C720.455,21.941 724.112,21.941 731.426,25.598 C735.083,25.598 742.397,29.255 746.055,29.255 C749.713,29.255 753.369,32.912 757.026,32.912 C760.683,32.912 764.34,36.569 764.34,40.227 C767.997,36.57 767.997,40.227 767.997,43.884 L767.997,54.855 C767.997,62.17 764.34,62.17 760.683,62.17 C757.026,62.17 753.369,62.17 749.712,58.513 C735.083,51.198 716.798,47.542 698.512,47.542 C687.541,47.542 672.912,51.199 661.94,54.857 C658.283,65.829 654.626,73.142 654.626,84.114 C654.626,91.428 658.283,98.743 661.94,102.399 C669.254,109.713 680.225,113.371 691.197,117.028 L727.769,128 C742.398,131.657 757.026,142.629 767.997,153.6 C775.311,164.571 782.626,179.2 778.968,193.828 C778.968,204.799 775.311,215.771 771.654,223.085 C767.997,234.056 760.683,241.37 753.369,245.028 C746.055,252.343 735.084,255.999 724.112,259.656 C713.14,263.313 702.169,266.971 687.54,266.971 L687.543,266.971 Z"
									id="Shape"
								/>
								<path
									d="M738.743,398.628 C650.972,464.457 522.972,497.371 416.914,497.371 C270.628,497.371 128,446.171 21.943,347.428 C10.971,336.457 18.286,329.142 29.257,332.8 C149.943,402.286 285.257,438.857 424.228,438.857 C526.628,438.857 629.028,416.914 727.771,376.686 C742.4,369.371 753.371,387.657 738.742,398.629 L738.743,398.628 Z"
									id="Shape"
								/>
								<path
									d="M775.314,354.743 C764.343,340.115 702.171,347.428 672.914,351.086 C665.6,351.086 661.943,343.771 669.257,340.115 C720.457,303.543 800.914,314.515 811.886,325.487 C822.858,336.459 808.229,420.572 760.686,460.802 C753.372,468.117 746.057,464.459 749.715,457.145 C764.344,427.888 786.287,369.373 775.315,354.745 L775.314,354.743 Z"
									id="Shape"
								/>
							</g>
						</g>
					</svg>
				</div>
				<div
					className={AmplifyUI.loadingSceneName}
					data-test={sumerianScene.loadingSceneName}
				>
					{props.sceneName}
				</div>
				{props.sceneError ? (
					<div
						className={AmplifyUI.sceneErrorText}
						data-test={sumerianScene.errorText}
					>
						{props.sceneError.displayText}
					</div>
				) : (
					<div
						className={AmplifyUI.loadingBar}
						data-test={sumerianScene.loadingBar}
					>
						<div
							className={AmplifyUI.loadingBarFill}
							style={{ width: `${props.percentage}%` }}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

/**
 * @deprecated use named import
 */
export default Loading;
