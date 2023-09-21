import {
  Controller,
  Post,
  UsePipes,
  Headers,
  Req,
  RawBodyRequest,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { Webhooks } from './enums/webhooks';
import { Request } from 'express';
import { WebhookGuard } from './webhook.guard';

//This idea is based on how you handle Stripe webhooks

@UseGuards(WebhookGuard)
@Controller('')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  //ASK: In task it said 'subsceibtion' i belive this is misspeled and would ask for clarification
  @Post(Webhooks.SubscriptionActivated)
  async subscriptionActivated(
    @Headers('payment-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!request.rawBody) throw new BadRequestException();
    return this.webhooksService.activate(signature, request.rawBody);
  }
  @Post(Webhooks.SubscriptionInactivated)
  @UsePipes(ZodValidationPipe)
  async subscriptionInactivated(
    @Headers('payment-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!request.rawBody) throw new BadRequestException();
    return this.webhooksService.activate(signature, request.rawBody);
  }
  @Post(Webhooks.SubscriptionCancelled)
  @UsePipes(ZodValidationPipe)
  async subscriptionCancelled(
    @Headers('payment-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!request.rawBody) throw new BadRequestException();
    return this.webhooksService.activate(signature, request.rawBody);
  }
}
