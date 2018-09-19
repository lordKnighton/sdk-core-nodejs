/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 1:24:26 pm
 * @Email:  developer@xyfindables.com
 * @Filename: scratch.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 19th September 2018 1:48:49 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:max-line-length

import { XyoDefaultPackerProvider } from '../../xyo-packer/xyo-default-packer-provider';
import { XyoSingleTypeArrayInt } from '../../components/arrays/xyo-single-type-array-int';

describe('XyoSingleTypeArrayInt', () => {
  it('Should deserialize', () => {
    const hexString = '01030000045602010000045002120202010704030103008d01c0369225914414689666668a0ee0b72683727deb17e6ad39a2d8edbe428894972da1fa3710b9bbc7eb0cfd6e8119426e2a2e295fd3ce342d28bf898964837b76ee8e442f278935ac783f2e854efe3a0bb77fa272ae18f351f5ff74f4b4e13bf756d285fdb62292cc3b660740ee763baaf281ee26a250ef4349c81d421147566524ccf2fbf2c82ed1c482c7e82e250e452ad1b74ec614bc343e627cdb921ba1e700f046f00c31197b83d0885340bd09b0aefd85aab9a4a347de11e1d132279445310705f5fcba68930c77a9aa354a7445273babbb74ce17abef9e5f775c86e2280efb33015e037c3d47dcd1bcb768240cfd17e985776850243d14b56b8f09010704030103009e9536d36ee226c66ffb33fd58df4dcb29259b220683e4fe6f3f67be674789a100664774792fc545af3612f081fced0f20a8a31333b4f17060e735e9e872007ade25506913444e7a9449399bcac11aaeda870a865217201a2926ca95750ca34c81dd1c215fd62c9964016e1ac21abcf834790ca689dad3ba4a863869fe484aa24d210d431b76143b0711bf2d62d73be1db44746f5aa7e9f06e0e4427e02c24b1a5772c892f2275626784d7abf747779e29024e2bc410ee2bbf6d47a36dfa1e5c369c6e605e618bbff6137e8e123e8477ee63a81c670f5cfff7fe6bf501b43193a08ebb8199d26c918286cec915eb95c398ae86744f02b65c874ccaedc3b999d70000002a0204000000120000000a02050000000000000004000000120000000708010a0000000708010a0210020301060508010270ba07a92ca81953cf1f2176eb98d5f262d4c278ed464c19c919673761d9a6a365e33f71d92cee89007f24604efe2b9a3be2df643298b64541d6deda7b1a15ff0f7da3d588fcc3528d304ca539e9fee36ada41b4466a402f76c5581b43b2c98da0d9ad850d8df1c02c5163eb2c40786e234f7f4cfee8b7b29d2f1af622526290c1ba3d3751234ff6d0999ca6cad8266482091bf73f9f85e1a5f2c61f41ec30301790a7c11a67f2a209d08bb1d18bc60582c8b447d926d074e927b2e89a719000f15bf0beee90b08cba5fb757531d5fa68df3913fbca7da584fd8ca5805ee9a190876fa8ee7b15d45d2123f7805940aaa9da4cf39cf2e35c926a3999f93d0ed1501060508010234bf67efbf4847472e6168fd7c624b83bfbf5e64d3460df4a16702321cc43b9db60cf2b1b037ced4c915facb05e246b02f8a725f34a4c7c287dc12f3a00f655955075b02dacda23e24adfd5bbc6cfd72de4b5e5d55fa13b3dfc74dfd27622700c57932916c4e8b06125cf3d6366b9ebbbc7cb620d767633d6cf4e73ff37efce8e6a31449c3197c9007091c7d45b3d65d4ed8f4554785aaafe3c7cf9919b0d265359fa5fe942ed613434aacae273f7002716fa39996d3649ccc3e2f7aafee581e83e6377048caa67a71281132f2647bd908549d44174c3fb221dc41c0c8196d43b64ff2ba2687e23774faed7000c7724210bb42ddb7a5b1c07e62359219e982a1';
    const buffer = Buffer.from(hexString, 'hex');
    const packer = new XyoDefaultPackerProvider().getXyoPacker();
    const singleTypeArrayInt = packer.deserialize(buffer) as XyoSingleTypeArrayInt;
  });
});
