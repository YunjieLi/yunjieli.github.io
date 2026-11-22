import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

export default function Mp3Convertor() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link to="/toc" className="text-sm text-muted-foreground hover:text-foreground">
        网站目录
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">YouTube 转 MP3</h1>
      <p className="mt-3 text-muted-foreground">
        在 Mac 上启动转换器后，即可批量转换、下载 MP3，或加入 7MagicFlowers RSS。
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a className={buttonVariants()} href="http://127.0.0.1:8765/mp3-convertor/">
          打开本机转换器
        </a>
        <a
          className={buttonVariants({ variant: 'outline' })}
          href="https://github.com/YunjieLi/yunjieli.github.io/tree/master/mp3-convertor#readme"
        >
          启动说明
        </a>
      </div>
    </main>
  )
}
