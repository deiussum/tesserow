// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  // WebKitGTK's DMA-BUF renderer (default since 2.42) fails to allocate a GBM
  // buffer on some GPU stacks - notably NVIDIA's proprietary driver - leaving
  // a blank window and "Failed to create GBM buffer" in stderr. Disabling it
  // falls back to a compatible rendering path. Set before GTK/WebKit init and
  // before any other threads exist, so the env var mutation is sound.
  #[cfg(target_os = "linux")]
  unsafe {
    std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
  }

  app_lib::run();
}
