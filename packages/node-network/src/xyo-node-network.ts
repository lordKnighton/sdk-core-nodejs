/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 28th January 2019 5:30:48 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node-network.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 7th February 2019 3:27:23 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNodeNetwork, IXyoComponentFeatureResponse } from "./@types"
import { unsubscribeFn, IXyoP2PService } from "@xyo-network/p2p"
import { IRequestPermissionForBlockResult } from "@xyo-network/attribution-request"
import { XyoBase } from "@xyo-network/base"
import { IXyoHash, IXyoHashProvider } from "@xyo-network/hashing"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { XyoMessageParser } from "./parsers"
import { IXyoOriginChainRepository } from '@xyo-network/origin-chain'
import { IXyoOriginBlockRepository } from "@xyo-network/origin-block-repository"
import { IXyoBoundWitnessSuccessListener, IXyoBoundWitnessPayloadProvider } from '@xyo-network/peer-interaction'
import { XyoBlockPermissionResponseHandler } from "./handlers/xyo-block-permission-response-handler"
import { XyoRequestPermissionForBlockHandler } from "./handlers/xyo-request-permission-for-block-handler"

export class XyoNodeNetwork extends XyoBase implements IXyoNodeNetwork {

  private unsubscribeComponentFeature: unsubscribeFn | undefined
  private messageParser: XyoMessageParser

  constructor (
    private readonly p2pService: IXyoP2PService,
    private readonly serializationService: IXyoSerializationService,
    private readonly hashProvider: IXyoHashProvider,
    private readonly originBlockRepository: IXyoOriginBlockRepository,
    private readonly originChainRepository: IXyoOriginChainRepository,
    private readonly payloadProvider: IXyoBoundWitnessPayloadProvider,
    private readonly boundWitnessSuccessListener: IXyoBoundWitnessSuccessListener
  ) {
    super()
    this.messageParser = new XyoMessageParser(serializationService)
  }

  public serviceBlockPermissionRequests(): unsubscribeFn {
    const handler = new XyoBlockPermissionResponseHandler(
      this.serializationService,
      this.originBlockRepository,
      this.originChainRepository,
      this.payloadProvider,
      this.boundWitnessSuccessListener,
      this.p2pService
    )

    handler.initialize()
    return handler.unsubscribeAll.bind(handler)
  }

  public setFeatures(features: IXyoComponentFeatureResponse): void {
    const featureJSON = Buffer.from(JSON.stringify(features, null, 2))

    if (this.unsubscribeComponentFeature) {
      this.unsubscribeComponentFeature()
    }

    this.unsubscribeComponentFeature = this.p2pService.subscribe('component-feature:request', (senderPublicKey) => {
      this.logInfo(`Received component-feature:request from ${senderPublicKey}`)
      this.p2pService.publishMessageToPeer('component-feature:response',
        featureJSON,
        senderPublicKey
      )
    })
  }

  public requestFeatures(callback: (publicKey: string, featureRequest: IXyoComponentFeatureResponse) => void)
  : unsubscribeFn {
    this.logInfo(`Requesting features from network`)
    this.p2pService.publish('component-feature:request', Buffer.alloc(0))

    return this.p2pService.subscribe('component-feature:response', (pk, message) => {
      const parseFeatureResponse = this.messageParser.tryParseComponentFeature(message, { publicKey: pk })
      if (!parseFeatureResponse) {
        return
      }

      this.logInfo(`Received component-feature:response from ${pk} and payload:\n${message.toString()}`)
      callback(pk, parseFeatureResponse)
    })
  }

  public requestPermissionForBlock(
    blockHash: IXyoHash,
    callback: (publicKey: string, permissionRequest: IRequestPermissionForBlockResult) => void
  ): unsubscribeFn {

    const req = new XyoRequestPermissionForBlockHandler(
      this.serializationService,
      this.hashProvider,
      this.p2pService,
      this.originChainRepository,
      this.payloadProvider,
      this.boundWitnessSuccessListener,
      blockHash,
      callback
    )

    req.initialize()
    return req.unsubscribeAll.bind(req)
  }
}
