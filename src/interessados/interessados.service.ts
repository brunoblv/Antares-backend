import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InteressadoResponseDto } from './dto/interessado-response.dto';
import { CreateInteressadoDto } from './dto/create-interessado.dto';
import { UpdateInteressadoDto } from './dto/update-interessado.dto';

@Injectable()
export class InteressadosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lista todos os interessados (sem paginação)
   */
  async listaCompleta(): Promise<InteressadoResponseDto[]> {
    const interessados = await this.prisma.interessado.findMany({
      where: { ativo: true },
      orderBy: { valor: 'asc' },
    });

    return interessados.map((interessado) => ({
      id: interessado.id,
      valor: interessado.valor,
      criadoEm: interessado.criadoEm,
    }));
  }

  /**
   * Busca interessados por termo para autocomplete
   */
  async buscarPorTermo(termo: string): Promise<InteressadoResponseDto[]> {
    const interessados = await this.prisma.interessado.findMany({
      where: {
        valor: {
          contains: termo,
        },
        ativo: true,
      },
      orderBy: { valor: 'asc' },
      take: 10, // Limita a 10 resultados para performance
    });

    return interessados.map((interessado) => ({
      id: interessado.id,
      valor: interessado.valor,
      criadoEm: interessado.criadoEm,
    }));
  }

  /**
   * Cria um novo interessado
   */
  async criar(
    createInteressadoDto: CreateInteressadoDto,
  ): Promise<InteressadoResponseDto> {
    // Verifica se já existe um interessado ativo com o mesmo nome
    const interessadoExistente = await this.prisma.interessado.findFirst({
      where: { valor: createInteressadoDto.valor.trim(), ativo: true },
    });

    if (interessadoExistente) {
      throw new BadRequestException('Já existe um interessado com este nome.');
    }

    // Cria o interessado
    const interessado = await this.prisma.interessado.create({
      data: {
        valor: createInteressadoDto.valor.trim(),
      },
    });

    return {
      id: interessado.id,
      valor: interessado.valor,
      criadoEm: interessado.criadoEm,
    };
  }

  /**
   * Busca um interessado por ID
   */
  async buscarPorId(id: string): Promise<InteressadoResponseDto> {
    const interessado = await this.prisma.interessado.findUnique({
      where: { id, ativo: true },
    });

    if (!interessado) {
      throw new NotFoundException('Interessado não encontrado.');
    }

    return {
      id: interessado.id,
      valor: interessado.valor,
      criadoEm: interessado.criadoEm,
    };
  }

  /**
   * Atualiza um interessado
   */
  async atualizar(
    id: string,
    updateInteressadoDto: UpdateInteressadoDto,
  ): Promise<InteressadoResponseDto> {
    // Verifica se o interessado existe e está ativo
    const interessadoExistente = await this.prisma.interessado.findUnique({
      where: { id, ativo: true },
    });

    if (!interessadoExistente) {
      throw new NotFoundException('Interessado não encontrado.');
    }

    // Se está atualizando o valor, verifica se não existe outro ativo com o mesmo nome
    if (updateInteressadoDto.valor) {
      const interessadoComMesmoNome = await this.prisma.interessado.findFirst({
        where: {
          valor: updateInteressadoDto.valor.trim(),
          id: { not: id },
          ativo: true,
        },
      });

      if (interessadoComMesmoNome) {
        throw new BadRequestException(
          'Já existe outro interessado com este nome.',
        );
      }
    }

    // Atualiza o interessado
    const interessado = await this.prisma.interessado.update({
      where: { id },
      data: {
        valor: updateInteressadoDto.valor?.trim(),
      },
    });

    return {
      id: interessado.id,
      valor: interessado.valor,
      criadoEm: interessado.criadoEm,
    };
  }

  /**
   * Remove um interessado (soft delete - marca como inativo)
   */
  async remover(id: string): Promise<{ removido: boolean }> {
    // Verifica se o interessado existe e está ativo
    const interessado = await this.prisma.interessado.findUnique({
      where: { id, ativo: true },
    });

    if (!interessado) {
      throw new NotFoundException('Interessado não encontrado.');
    }

    // Verifica se há processos ativos vinculados
    const processosVinculados = await this.prisma.processo.count({
      where: { interessado_id: id, ativo: true },
    });

    if (processosVinculados > 0) {
      throw new BadRequestException(
        `Não é possível remover este interessado pois existem ${processosVinculados} processo(s) ativo(s) vinculado(s).`,
      );
    }

    // Remove o interessado (soft delete - marca como inativo)
    await this.prisma.interessado.update({
      where: { id },
      data: { ativo: false },
    });

    return { removido: true };
  }
}
