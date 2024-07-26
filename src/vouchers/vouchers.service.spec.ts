import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {}

  async createVoucher(name: string, amount: number, numGenerations: number) {
    const voucher = await this.prisma.voucherTable.create({
      data: {
        id: uuidv4(),
        name,
        amount,
        start_date: new Date(),
        end_date: new Date(),
      },
    });

    for (let i = 0; i < numGenerations; i++) {
      let code = this.generateUniqueCode();
      while (await this.prisma.uVCTable.findUnique({ where: { code } })) {
        code = this.generateUniqueCode();
      }

      await this.prisma.uVCTable.create({
        data: {
          id: uuidv4(),
          id_voucher: voucher.id,
          start_date: new Date(),
          end_date: new Date(),
          amount,
          code,
        },
      });
    }

    return voucher;
  }

  async updateVoucher(id: string, name: string, amount: number, numGenerations: number) {
    const voucher = await this.prisma.voucherTable.findUnique({ where: { id } });

    if (!voucher) {
      throw new HttpException('Voucher not found', HttpStatus.NOT_FOUND);
    }

    const existingUVCs = await this.prisma.uVCTable.count({ where: { id_voucher: id } });

    if (existingUVCs >= numGenerations) {
      throw new HttpException('Cannot decrease numGenerations below existing count', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.voucherTable.update({
      where: { id },
      data: {
        name,
        amount,
      },
    });

    for (let i = existingUVCs; i < numGenerations; i++) {
      let code = this.generateUniqueCode();
      while (await this.prisma.uVCTable.findUnique({ where: { code } })) {
        code = this.generateUniqueCode();
      }

      await this.prisma.uVCTable.create({
        data: {
          id: uuidv4(),
          id_voucher: id,
          start_date: new Date(),
          end_date: new Date(),
          amount,
          code,
        },
      });
    }

    return { message: 'Voucher updated successfully' };
  }

  private generateUniqueCode() {
    return Math.random().toString(36).substring(2, 5).toUpperCase();
  }
}
