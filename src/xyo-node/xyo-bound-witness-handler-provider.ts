/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 8:31:36 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-bound-witness-handler-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 29th October 2018 5:22:39 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNetworkPipe } from '../@types/xyo-network';
import { XyoBoundWitness } from '../xyo-bound-witness/bound-witness/xyo-bound-witness';
import { IXyoHashProvider } from '../@types/xyo-hashing';
import { extractNestedBoundWitnesses } from '../xyo-bound-witness/bound-witness/xyo-bound-witness-origin-chain-extractor';
import { IXyoBoundWitnessHandlerProvider, IXyoBoundWitnessPayloadProvider, IXyoBoundWitnessSuccessListener, IXyoBoundWitnessInteractionFactory } from '../@types/xyo-node';
import { IXyoOriginBlockRepository, IXyoOriginChainStateRepository } from '../@types/xyo-origin-chain';
import { XyoBase } from '../xyo-core-components/xyo-base';
import { XyoOriginBlockValidator } from '../xyo-origin-chain/xyo-origin-block-validator';

export class XyoBoundWitnessHandlerProvider extends XyoBase implements IXyoBoundWitnessHandlerProvider {

  constructor (
    private readonly hashingProvider: IXyoHashProvider,
    private readonly originState: IXyoOriginChainStateRepository,
    private readonly originChainNavigator: IXyoOriginBlockRepository,
    private readonly boundWitnessPayloadProvider: IXyoBoundWitnessPayloadProvider,
    private readonly boundWitnessSuccessListener: IXyoBoundWitnessSuccessListener,
    private readonly boundWitnessInteractionFactory: IXyoBoundWitnessInteractionFactory,
    private readonly originBlockValidator: XyoOriginBlockValidator
  ) {
    super();
  }

  public async handle(networkPipe: IXyoNetworkPipe): Promise<XyoBoundWitness> {
    const [payload, signers] = await Promise.all([
      this.boundWitnessPayloadProvider.getPayload(this.originState),
      this.originState.getSigners()
    ]);

    const interaction = this.boundWitnessInteractionFactory.newInstance(signers, payload);

    const boundWitness = await interaction.run(networkPipe);
    await this.handleBoundWitnessSuccess(boundWitness);
    return boundWitness;
  }

  /**
   * A helper function for processing successful bound witnesses
   */

  private async handleBoundWitnessSuccess(boundWitness: XyoBoundWitness): Promise<void> {
    const hashValue = await boundWitness.getHash(this.hashingProvider);
    try {
      await this.originBlockValidator.validateOriginBlock(hashValue, boundWitness);
    } catch (err) {
      this.logError(`Origin block failed validation. Will not add. ${err}`);
      throw err;
    }

    await this.originState.updateOriginChainState(hashValue);
    await this.originChainNavigator.addOriginBlock(hashValue, boundWitness);
    const nestedBoundWitnesses = extractNestedBoundWitnesses(boundWitness);

    await Promise.all(nestedBoundWitnesses.map(async (nestedBoundWitness) => {
      const nestedHashValue = await nestedBoundWitness.getHash(this.hashingProvider);
      const nestedHash = nestedHashValue.serialize(true);
      this.logInfo(`Extracted nested block with hash ${nestedHash.toString('hex')}`);
      const containsBlock = await this.originChainNavigator.containsOriginBlock(nestedHash);
      if (!containsBlock) {
        try {
          await this.originBlockValidator.validateOriginBlock(nestedHashValue, nestedBoundWitness);
        } catch (err) {
          this.logError(`Origin block failed validation. Will not add. ${err}`);
          throw err;
        }

        return this.originChainNavigator.addOriginBlock(nestedHashValue, nestedBoundWitness);
      }
    }));

    if (this.boundWitnessSuccessListener) {
      await this.boundWitnessSuccessListener.onBoundWitnessSuccess(boundWitness);
    }

    return;
  }
}