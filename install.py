#!/usr/bin/env python3
"""
Skills-v2 安装器
Claude Code 多模型协作系统

用法:
    python install.py                    # 安装核心模块（默认）
    python install.py --module core      # 安装核心模块
    python install.py --module all       # 安装所有启用的模块
    python install.py --list-modules     # 列出可用模块
    python install.py --install-dir ~/.claude  # 自定义安装目录
"""

from __future__ import annotations

import argparse
import json
import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List

DEFAULT_INSTALL_DIR = "~/.claude"
DEFAULT_CONFIG = "config.json"

# 检测操作系统
IS_WINDOWS = platform.system() == "Windows"

# Auggie MCP 常见安装路径
if IS_WINDOWS:
    AUGGIE_PATHS = [
        os.path.join(os.environ.get("APPDATA", ""), "npm", "node_modules", "@augmentcode", "auggie", "augment.mjs"),
        os.path.join(os.environ.get("LOCALAPPDATA", ""), "npm", "node_modules", "@augmentcode", "auggie", "augment.mjs"),
        os.path.join(os.environ.get("USERPROFILE", ""), "node_modules", "@augmentcode", "auggie", "augment.mjs"),
    ]
else:
    AUGGIE_PATHS = [
        "~/.npm-global/lib/node_modules/@augmentcode/auggie/augment.mjs",
        "/usr/local/lib/node_modules/@augmentcode/auggie/augment.mjs",
        "~/.local/lib/node_modules/@augmentcode/auggie/augment.mjs",
    ]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Skills-v2 安装器 - 多模型协作系统"
    )
    parser.add_argument(
        "--install-dir",
        default=DEFAULT_INSTALL_DIR,
        help=f"安装目录（默认: {DEFAULT_INSTALL_DIR}）",
    )
    parser.add_argument(
        "--module",
        default="core",
        help="要安装的模块: 'core', 'codex-only', 'gemini-only', 或 'all'",
    )
    parser.add_argument(
        "--config",
        default=DEFAULT_CONFIG,
        help="配置文件路径",
    )
    parser.add_argument(
        "--list-modules",
        action="store_true",
        help="列出可用模块并退出",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="强制覆盖现有文件",
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="显示详细输出",
    )
    return parser.parse_args()


def load_config(config_path: str) -> Dict[str, Any]:
    path = Path(config_path)
    if not path.exists():
        print(f"错误: 配置文件未找到: {config_path}", file=sys.stderr)
        sys.exit(1)

    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def list_modules(config: Dict[str, Any]) -> None:
    print("\n📦 可用模块:\n")
    modules = config.get("modules", {})
    for name, module in modules.items():
        status = "✅ 已启用" if module.get("enabled", False) else "⚪ 未启用"
        desc = module.get("description", "无描述")
        print(f"  {name:15} {status:12} - {desc}")
    print()


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def copy_file(src: Path, dst: Path, verbose: bool = False) -> None:
    ensure_dir(dst.parent)
    shutil.copy2(src, dst)
    if verbose:
        print(f"  📄 已复制: {src.name} -> {dst}")


def copy_dir(src: Path, dst: Path, verbose: bool = False) -> None:
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst)
    if verbose:
        print(f"  📁 已复制目录: {src.name} -> {dst}")


def merge_dir(src: Path, dst: Path, verbose: bool = False) -> None:
    ensure_dir(dst)
    for item in src.iterdir():
        dst_item = dst / item.name
        if item.is_file():
            shutil.copy2(item, dst_item)
            if verbose:
                print(f"  📄 已合并: {item.name}")
        elif item.is_dir():
            if dst_item.exists():
                merge_dir(item, dst_item, verbose)
            else:
                shutil.copytree(item, dst_item)
                if verbose:
                    print(f"  📁 已合并目录: {item.name}")


def check_go_installed() -> bool:
    try:
        result = subprocess.run(
            ["go", "version"],
            capture_output=True,
            text=True
        )
        return result.returncode == 0
    except FileNotFoundError:
        return False


def find_auggie_mjs() -> Path | None:
    """查找 Auggie MCP 的 augment.mjs 文件"""
    for path_str in AUGGIE_PATHS:
        path = Path(path_str).expanduser()
        if path.exists():
            return path
    return None


def patch_auggie_mcp(
    patch_file: Path,
    verbose: bool = False
) -> tuple[bool, str]:
    """
    使用增强版 augment.mjs 修补 Auggie MCP
    返回 (成功, 消息)
    """
    auggie_path = find_auggie_mjs()

    if not auggie_path:
        return False, "未找到 Auggie MCP，请先安装 @augmentcode/auggie"

    if not patch_file.exists():
        return False, f"补丁文件未找到: {patch_file}"

    # 创建备份
    backup_path = auggie_path.with_suffix(".mjs.backup")
    if not backup_path.exists():
        try:
            shutil.copy2(auggie_path, backup_path)
            if verbose:
                print(f"  💾 已创建备份: {backup_path}")
        except Exception as e:
            return False, f"创建备份失败: {e}"
    else:
        if verbose:
            print(f"  💾 备份已存在: {backup_path}")

    # 应用补丁
    try:
        shutil.copy2(patch_file, auggie_path)
        if verbose:
            print(f"  ✅ 已修补: {auggie_path}")
        return True, f"Auggie MCP 修补成功，备份位置: {backup_path}"
    except PermissionError:
        if IS_WINDOWS:
            return False, f"权限不足，请以管理员身份运行"
        else:
            return False, f"权限不足，请尝试: sudo cp {patch_file} {auggie_path}"
    except Exception as e:
        return False, f"应用补丁失败: {e}"


def get_prebuilt_binary(source_dir: Path) -> Path | None:
    """查找预编译的二进制文件"""
    system = platform.system().lower()
    machine = platform.machine().lower()

    # 映射架构名称
    arch_map = {
        "x86_64": "amd64",
        "amd64": "amd64",
        "arm64": "arm64",
        "aarch64": "arm64",
    }
    arch = arch_map.get(machine, machine)

    # 映射系统名称
    if system == "darwin":
        binary_name = f"codeagent-wrapper-darwin-{arch}"
    elif system == "linux":
        binary_name = f"codeagent-wrapper-linux-{arch}"
    elif system == "windows":
        binary_name = f"codeagent-wrapper-windows-{arch}.exe"
    else:
        return None

    binary_path = source_dir / "bin" / binary_name
    if binary_path.exists():
        return binary_path
    return None


def build_go_binary(
    source_dir: Path,
    binary_name: str,
    verbose: bool = False
) -> tuple[bool, Path | None]:
    if not check_go_installed():
        print("  ❌ Go 未安装，请先安装 Go:", file=sys.stderr)
        print("     https://go.dev/doc/install", file=sys.stderr)
        return False, None

    # Windows 添加 .exe 扩展名
    if IS_WINDOWS and not binary_name.endswith(".exe"):
        output_name = binary_name + ".exe"
    else:
        output_name = binary_name

    if verbose:
        print(f"  🔨 正在编译 {output_name}...")

    try:
        result = subprocess.run(
            ["go", "build", "-o", output_name, "."],
            cwd=source_dir,
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            print(f"  ❌ 编译失败: {result.stderr}", file=sys.stderr)
            return False, None

        binary_path = source_dir / output_name
        if not binary_path.exists():
            print(f"  ❌ 编译后未找到二进制文件", file=sys.stderr)
            return False, None

        if verbose:
            print(f"  ✅ 编译完成: {output_name}")

        return True, binary_path

    except Exception as e:
        print(f"  ❌ 编译错误: {e}", file=sys.stderr)
        return False, None


def install_binary_to_path(
    binary_path: Path,
    verbose: bool = False,
    target_name: str | None = None
) -> bool:
    # 确定目标文件名
    if target_name:
        if IS_WINDOWS and not target_name.endswith(".exe"):
            final_name = target_name + ".exe"
        else:
            final_name = target_name
    else:
        final_name = binary_path.name

    # 根据系统选择安装目录
    if IS_WINDOWS:
        install_dirs = [
            Path.home() / ".local" / "bin",
            Path(os.environ.get("LOCALAPPDATA", "")) / "Programs" / "codeagent-wrapper",
            Path.home() / "bin",
        ]
    else:
        install_dirs = [
            Path.home() / ".local" / "bin",
            Path("/usr/local/bin"),
        ]

    for install_dir in install_dirs:
        if install_dir.exists() or install_dir == install_dirs[0]:
            try:
                ensure_dir(install_dir)
                target = install_dir / final_name
                shutil.copy2(binary_path, target)

                # 设置执行权限（仅 Unix）
                if not IS_WINDOWS:
                    os.chmod(target, 0o755)

                if verbose:
                    print(f"  📦 已安装到: {target}")

                # 检查安装目录是否在 PATH 中
                path_dirs = os.environ.get("PATH", "").split(os.pathsep)
                if str(install_dir) not in path_dirs:
                    print(f"  ⚠️  注意: {install_dir} 可能不在 PATH 中")
                    if IS_WINDOWS:
                        print(f"     添加到 PATH: setx PATH \"%PATH%;{install_dir}\"")
                    else:
                        print(f"     添加到 PATH: export PATH=\"{install_dir}:$PATH\"")

                return True
            except PermissionError:
                if verbose:
                    print(f"  ⚠️  {install_dir} 权限不足，尝试下一个...")
                continue
            except Exception as e:
                if verbose:
                    print(f"  ⚠️  安装到 {install_dir} 失败: {e}")
                continue

    print("  ❌ 无法安装二进制文件到 PATH", file=sys.stderr)
    if IS_WINDOWS:
        print(f"     手动安装: 复制 {binary_path} 到 PATH 中的目录", file=sys.stderr)
    else:
        print(f"     手动安装: sudo cp {binary_path} /usr/local/bin/", file=sys.stderr)
    return False


def execute_operation(
    op: Dict[str, Any],
    source_dir: Path,
    install_dir: Path,
    verbose: bool = False
) -> bool:
    op_type = op.get("type")
    source = op.get("source", "")
    target = op.get("target", source)
    desc = op.get("description", "")

    src_path = source_dir / source
    dst_path = install_dir / target

    if verbose:
        print(f"\n  🔧 {desc}")

    try:
        if op_type == "copy_file":
            if not src_path.exists():
                print(f"  ⚠️  源文件未找到: {src_path}", file=sys.stderr)
                return False
            copy_file(src_path, dst_path, verbose)

        elif op_type == "copy_dir":
            if not src_path.exists():
                print(f"  ⚠️  源目录未找到: {src_path}", file=sys.stderr)
                return False
            copy_dir(src_path, dst_path, verbose)

        elif op_type == "merge_dir":
            if not src_path.exists():
                print(f"  ⚠️  源目录未找到: {src_path}", file=sys.stderr)
                return False
            merge_dir(src_path, dst_path, verbose)

        elif op_type == "build_go":
            binary_name = op.get("binary", "")

            # 优先使用预编译的二进制文件
            prebuilt = get_prebuilt_binary(source_dir)
            if prebuilt:
                if verbose:
                    print(f"  📦 使用预编译二进制: {prebuilt.name}")
                # 重命名为目标名称
                target_name = binary_name
                if IS_WINDOWS and not target_name.endswith(".exe"):
                    target_name += ".exe"
                binary_path = prebuilt
            else:
                # 没有预编译二进制，尝试编译
                if verbose:
                    print(f"  ℹ️  未找到预编译二进制，尝试编译...")
                if not src_path.exists():
                    print(f"  ⚠️  源目录未找到: {src_path}", file=sys.stderr)
                    return False

                success, binary_path = build_go_binary(src_path, binary_name, verbose)
                if not success:
                    return False

            # 安装到 PATH
            if not install_binary_to_path(binary_path, verbose, target_name=binary_name):
                return False

        elif op_type == "patch_auggie":
            if not src_path.exists():
                print(f"  ⚠️  补丁文件未找到: {src_path}", file=sys.stderr)
                return False

            success, message = patch_auggie_mcp(src_path, verbose)
            if not success:
                print(f"  ⚠️  {message}", file=sys.stderr)
                return False
            if verbose:
                print(f"  ℹ️  {message}")

        else:
            print(f"  ⚠️  未知操作类型: {op_type}", file=sys.stderr)
            return False

        return True

    except Exception as e:
        print(f"  ❌ 错误: {e}", file=sys.stderr)
        return False


def install_module(
    name: str,
    module: Dict[str, Any],
    source_dir: Path,
    install_dir: Path,
    verbose: bool = False
) -> bool:
    print(f"\n📦 正在安装模块: {name}")
    print(f"   {module.get('description', '')}")

    operations = module.get("operations", [])
    success_count = 0

    for op in operations:
        if execute_operation(op, source_dir, install_dir, verbose):
            success_count += 1

    if success_count == len(operations):
        print(f"   ✅ 模块 '{name}' 安装成功!")
        return True
    else:
        print(f"   ⚠️  模块 '{name}' 安装完成，但有 {len(operations) - success_count} 个警告")
        return False


def main() -> int:
    args = parse_args()

    # 解析路径
    config_path = Path(args.config)
    if not config_path.is_absolute():
        config_path = Path(__file__).parent / args.config

    source_dir = config_path.parent
    install_dir = Path(args.install_dir).expanduser().resolve()

    # 加载配置
    config = load_config(str(config_path))

    # 列出模块模式
    if args.list_modules:
        list_modules(config)
        return 0

    # 打印标题
    print("\n" + "=" * 50)
    print("🚀 Skills-v2 安装器")
    print("   多模型协作系统")
    print("=" * 50)
    print(f"\n📁 安装目录: {install_dir}")

    # 确保安装目录存在
    ensure_dir(install_dir)

    # 确定要安装的模块
    modules = config.get("modules", {})
    modules_to_install = []

    if args.module == "all":
        modules_to_install = [
            (name, mod) for name, mod in modules.items()
            if mod.get("enabled", False)
        ]
    elif args.module in modules:
        modules_to_install = [(args.module, modules[args.module])]
    else:
        print(f"\n❌ 未知模块: {args.module}", file=sys.stderr)
        print("   使用 --list-modules 查看可用模块")
        return 1

    if not modules_to_install:
        print("\n⚠️  没有可安装的模块")
        return 0

    # 安装模块
    success = True
    for name, module in modules_to_install:
        if not install_module(name, module, source_dir, install_dir, args.verbose):
            success = False

    # 打印摘要
    print("\n" + "=" * 50)
    if success:
        print("✅ 安装完成!")
        print("\n📋 已安装命令 (/ccg:xxx):")
        print("   开发工作流:")
        print("     /ccg:dev      - 完整6阶段多模型工作流")
        print("     /ccg:frontend - 前端任务 → Gemini")
        print("     /ccg:backend  - 后端任务 → Codex")
        print("     /ccg:review   - 双模型代码审查")
        print("     /ccg:analyze  - 双模型分析")
        print("     /ccg:enhance  - Prompt 增强")
        print("   Git 工具:")
        print("     /ccg:commit        - 智能提交")
        print("     /ccg:rollback      - 交互式回滚")
        print("     /ccg:clean-branches - 清理分支")
        print("     /ccg:worktree      - Worktree 管理")
        print("   项目初始化:")
        print("     /ccg:init     - 初始化项目 AI 上下文")
        print("\n🎯 快速开始:")
        print('   /ccg:dev "实现用户认证功能"')
    else:
        print("⚠️  安装完成，但有警告")
    print("=" * 50 + "\n")

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
