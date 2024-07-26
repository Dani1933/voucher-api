import { Controller, Post, Body, Param, Put, HttpException, HttpStatus } from '@nestjs/common';
import { VouchersService } from './vouchers.service';

@Controller('generate/uvc')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  async createVoucher(@Body() body: { name: string; amount: number; num_generations: number }) {
    try {
      return await this.vouchersService.createVoucher(body.name, body.amount, body.num_generations);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':voucher_id')
  async updateVoucher(
    @Param('voucher_id') voucherId: string,
    @Body() body: { name: string; amount: number; num_generations: number }
  ) {
    try {
      return await this.vouchersService.updateVoucher(voucherId, body.name, body.amount, body.num_generations);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
